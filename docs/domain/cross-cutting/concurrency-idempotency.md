# Domain Specification: Concurrency

## 1. Purpose

Ensures strict data consistency during parallel operations, eliminating race conditions, stale writes, and counter drift across domain boundaries.

---

## 2. Concurrency Strategies

### 1. Multi-Document Transactions

Used for operations involving:

- Multiple aggregate documents
- Counter increments and decrements
- Role or ownership transitions

### 2. Optimistic Concurrency Control (OCC)

Every aggregate root (`User`, `Organization`, `Membership`, `Project`) must maintain a concurrency field:

- `version` (`integer`) or `updatedAt` (`timestamp`)

### 3. Unique Database Constraints

Unique compound indexes to eliminate "double create" race conditions:

- `Membership(userId, organizationId)`
- `TeamMembership(userId, teamId)`
- `ProjectMembership(userId, projectId)`
- `Invitation(organizationId, targetEmail)`

---

## 3. Write Pattern

Every state modification on an aggregate root must enforce optimistic locking via expected version checking:

- **Execution:** `UPDATE Aggregate SET ... WHERE id = :id AND version = :expectedVersion`
- **Failure Rule:** If `modifiedCount == 0`, immediately throw `ConcurrentModification` (`CONCURRENCY`).

---

## 4. Critical Domain Hotspots

### TransferOwnership

- **Problem:** Parallel transfer attempts leading to multiple owners or lost ownership state.
- **Solution:** Execute within a multi-document transaction:
  - Update current owner $\rightarrow$ `Admin`
  - Update target user $\rightarrow$ `Owner`
  - Update `User.ownershipCount` for both users
  - Validate precondition: `targetUser.ownershipCount < MAX_OWNERSHIP_LIMIT`

### CreateOrganization

- **Problem:** Concurrent requests exceeding the maximum allowed ownership limit.
- **Solution:** Execute within a multi-document transaction:
  - Increment `User.ownershipCount` with condition (`WHERE ownershipCount < MAX`)
  - Create `Organization` aggregate
  - Create initial `Membership` (`role = Owner`)

### AcceptInvitation

- **Problem:** Double acceptance leading to duplicate membership records.
- **Solution:** Compound unique index `(userId, organizationId)` combined with a transaction:
  - Create `Membership`
  - Mark `Invitation` as accepted

### Membership State Changes (`SuspendMembership`, `RemoveMember`, `ChangeRole`)

- **Problem:** Concurrent state updates corrupting membership transitions.
- **Solution:** Update with explicit state precondition (`WHERE state == expectedState`).

### Counter Synchronization (`User.ownershipCount`, `User.membershipCount`, `Organization.memberCount`)

- **Problem:** Counter drift caused by uncoordinated parallel writes.
- **Solution:** **ALWAYS** execute within a multi-document transaction **OR** perform via atomic update operations with boundary constraints.

---

## 5. Global Rules

- **Multi-Aggregate Mutations:** Require multi-document transactions.
- **Single-Aggregate Mutations:** Guarded via optimistic concurrency (`version` check).
- **Uniqueness:** Enforced via database unique indexes.
- **Error Handling:** Treat `ConcurrentModification` as an expected operational outcome eligible for client/application retry.

# Domain Specification: Idempotency

## 1. Purpose

Guarantees that executing the exact same command multiple times produces the identical system state without causing unintended side effects, corrupting data, or generating duplicate entities.

---

## 2. Command Classifications

### Idempotent Commands

- **Commands:** `LogoutUser`, `RemoveMember`, `SuspendMembership`, `ArchiveOrganization`, `ArchiveProject`, `ArchiveTeam`
- **Behavior:** If the target resource is already in the desired end state, the operation yields success without modifying state (no-op).

### Semi-Idempotent Commands (State-Dependent)

- **Commands:** `ChangeRole`, `TransferOwnership`, `RestoreMembership`
- **Behavior:** Evaluates current domain state prior to execution. Re-applying identical state parameters evaluates to a successful outcome.

### Non-Idempotent Commands (Protection Required)

- **Commands:** `CreateOrganization`, `RegisterUser`, `CreateInvitation`, `AddTeamMember`, `AddProjectMember`
- **Behavior:** High risk of entity duplication on retries. Must be guarded by database unique constraints or client-supplied idempotency keys.

---

## 3. Core Strategies

### 1. State as Source of Truth (No-Op Pattern)

Evaluate the aggregate's current state prior to applying command logic:

- Instead of throwing a business error when a state transition is already complete, return a successful response.
- _Example:_ Executing `RemoveMember` when `Membership.state == Removed` returns `SUCCESS` (no-op) instead of `MembershipAlreadyRemoved`.

### 2. Unique Database Constraints

Database unique indexes serve as the ultimate fallback defense against duplicate creation retries:

- _Example:_ A duplicate `AcceptInvitation` request triggering `Membership(userId, organizationId)` unique index violation is caught and mapped to a successful no-op response.

### 3. Idempotency Keys (`requestId`)

Applied to resource creation commands (`CreateOrganization`, `TransferOwnership`):

- A unique client-provided request identifier (`idempotencyKey` / `requestId`) cached at the API layer to intercept duplicate retries before reaching domain logic.

---

## 4. Implementation Pattern & Error Semantics

### Execution Flow

```typescript
if (resource.isAlreadyInState(command.desiredState)) {
  return Result.successNoOp();
}

executeCommand(command);
```

### Error Model Metadata

Commands and errors include operational flags to guide client handling:

- `retryable`: `true` | `false`
- `idempotent`: `true` | `false`

---

## 5. Key Anti-Patterns to Avoid

- **Treating "Already Done" as an Error:** Returning an error when a resource is already in the target state breaks automated client retry mechanisms.
- **Unprotected Resource Creation:** Omitting unique database indexes leads to orphaned or duplicate entities during network timeouts.
- **Missing Database Safeguards:** Relying solely on application-level state checks without database-level constraints.

---

## 6. Global Rules

- **Idempotency = Safe Retries:** All command handlers must support safe client-side retries.
- **Unique Index Foundation:** Unique database constraints are mandatory for all entity relationships.
- **Target State Alignment = Success:** Aligning a resource to its existing state yields `SUCCESS`, not an error.
