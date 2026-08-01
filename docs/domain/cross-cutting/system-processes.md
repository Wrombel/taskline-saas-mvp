# Domain Specification: System Processes

## 1. Overview & Purpose

System Processes are asynchronous, automated, or background actions executed by the system actor outside the direct request-response lifecycle of a user. They ensure temporal state updates, enforce cross-context security invariants, maintain eventual data consistency, and react to domain event streams.

### Primary Sources

- **Time-Based (TTL / Scheduled):** Periodic triggers evaluated against time thresholds.
- **Consistency & Reconciliation:** Self-healing jobs to repair counter drift and verify global invariants.
- **Security Enforcement:** Automated session revocations and permission downgrades triggered by state changes.
- **Event-Driven Handlers:** Asynchronous reactions to published domain events.

---

## 2. Process Registry

### 2.1 Time-Based Processes (TTL / Cron)

#### Process: `SessionTTLReached`

- **Trigger:** `Session.expiresAt < currentTime`
- **Preconditions:** `Session.state == Active`
- **Effects:**
  - Transition `Session.state` $\rightarrow$ `Expired`
- **Emit:** `SessionExpired`

#### Process: `InvitationTTLReached`

- **Trigger:** `Invitation.expiresAt < currentTime`
- **Preconditions:** `Invitation.state == Pending`
- **Effects:**
  - Transition `Invitation.state` $\rightarrow$ `Expired`
- **Emit:** `InvitationExpired`

#### Process: `PasswordResetTTL`

- **Trigger:** `PasswordResetToken.expiresAt < currentTime`
- **Preconditions:** `PasswordResetToken.state == Active`
- **Effects:**
  - Invalidate reset token (`Token.state = Expired`)

---

### 2.2 Consistency & Reconciliation Processes

#### Process: `RebuildCounters`

- **Purpose:** Periodic or on-demand repair of counter drift across aggregates.
- **Target Aggregates:** `User.ownershipCount`, `User.membershipCount`, `Organization.memberCount`
- **Execution Strategy:**
  - Recalculate true counts directly from the `Membership` collection.
  - Compare calculated values against cached aggregate counters.
  - Apply atomic correction updates if a disparity is detected.

#### Process: `EnsureSingleOwner`

- **Trigger:** Invariant check following any `Membership` state change or `TransferOwnership` execution.
- **Check:** Assert that `Organization` has exactly 1 active `Owner`.
- **Failure Mitigation:**
  - Log a critical domain error.
  - Block further write operations on the target `Organization` until manually or automatically reconciled.

---

### 2.3 Security Enforcement Processes

#### Process: `RevokeSessionsOnDeactivate`

- **Trigger:** Domain event `UserDeactivated`
- **Target:** `Session` aggregate
- **Effects:**
  - Revoke all active sessions belonging to the target `User` across all tenants (`Session.state = Revoked`).

#### Process: `RevokeTenantSessionOnMembershipChange`

- **Trigger:** Domain events `MembershipSuspended` or `MembershipRemoved`
- **Target:** Active user sessions bound to the affected `Organization`
- **Effects:**
  - Downgrade active `TenantBound` sessions back to base `Identity` sessions.
  - Force tenant re-selection if the user attempts to act within that organization scope.

---

### 2.4 Event-Driven Processes

#### Process: `OnInvitationAccepted`

- **Trigger:** Domain event `InvitationAccepted`
- **Effects:**
  - Create active `Membership` entity within the target `Organization`.
  - Atomically increment `Organization.memberCount` and `User.membershipCount`.

#### Process: `OnOrganizationArchived`

- **Trigger:** Domain event `OrganizationArchived`
- **Effects:**
  - Invalidate active session scopes bound to the archived organization.
  - Enforce read-only state across all nested resources (Teams, Projects, Memberships).

---

## 3. Operational Guarantees & Invariants

- **Idempotency Mandate:** Every system process must be fully idempotent. Re-executing a process with the same inputs or state must produce identical side-effects without error.
- **Retry Tolerance:** Handlers must tolerate unexpected execution failures and support safe automated retries.
- **System Actor Scoping:** System processes run under a privileged `System` context and bypass user-bound authorization checks, but must strictly enforce domain invariants.
- **Auditability:** All system-initiated state transitions must publish corresponding domain events for tracking and auditing purposes.
