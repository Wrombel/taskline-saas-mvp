# Error Model Specification

## 1. Error Categories

- **`DOMAIN`**: Violations of business invariants, state rules, or domain constraints.
- **`AUTHORIZATION`**: Insufficient actor permissions, unauthorized roles, or forbidden actions.
- **`CONCURRENCY`**: Race conditions, optimistic locking failures, or transactional write conflicts.
- **`VALIDATION`**: Malformed input payloads, invalid parameter formats, or schema violations.
- **`NOT_FOUND`**: Target entity or resource instance does not exist in the domain scope.

---

## 2. Command Error Mappings

### User Commands

#### Command: `RegisterUser`

- **Errors:**
  - `EmailAlreadyExists` (`DOMAIN`)
  - `InvalidEmailFormat` (`VALIDATION`)
  - `ActiveSessionExists` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `DeactivateUser`

- **Errors:**
  - `UserAlreadyDeactivated` (`DOMAIN`)
  - `ActiveOwnershipExists` (`DOMAIN`)
  - `MembershipNotEligibleForDeactivation` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `ChangeUserEmail`

- **Errors:**
  - `EmailAlreadyTaken` (`DOMAIN`)
  - `InvalidEmailFormat` (`VALIDATION`)
  - `UserNotActive` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `RequestPasswordReset`

- **Errors:**
  - `UserNotFound` (`NOT_FOUND`) _(Optionally masked for security)_
  - `TooManyRequests` (`DOMAIN`)

#### Command: `ResetPassword`

- **Errors:**
  - `InvalidToken` (`VALIDATION`)
  - `TokenExpired` (`DOMAIN`)
  - `UserNotFound` (`NOT_FOUND`)

---

### Session Commands

#### Command: `LoginUser`

- **Errors:**
  - `InvalidCredentials` (`AUTHORIZATION`)
  - `ActiveSessionExists` (`DOMAIN`)
  - `UserDeactivated` (`DOMAIN`)
  - `MaxSessionsReached` (`DOMAIN`)

#### Command: `SelectTenant`

- **Errors:**
  - `MembershipNotFound` (`NOT_FOUND`)
  - `MembershipNotActive` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `SessionNotActive` (`DOMAIN`)

#### Command: `LogoutUser`

- **Errors:**
  - `SessionNotFound` (`NOT_FOUND`)
  - `SessionAlreadyRevoked` (`DOMAIN`) _(Idempotent – treated as success)_

#### Command / Handler: `SessionTTLReached` _(System)_

- **Errors:**
  - `SessionNotFound` (`NOT_FOUND`)

---

### Organization Commands

#### Command: `CreateOrganization`

- **Errors:**
  - `OwnershipLimitReached` (`DOMAIN`)
  - `UserNotActive` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `ArchiveOrganization`

- **Errors:**
  - `OrganizationNotFound` (`NOT_FOUND`)
  - `OrganizationAlreadyArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `NotOwner` (`AUTHORIZATION`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `RestoreOrganization`

- **Errors:**
  - `OrganizationNotFound` (`NOT_FOUND`)
  - `OrganizationNotArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `OwnerNotActive` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `ChangeOrganizationRole`

- **Errors:**
  - `MembershipNotFound` (`NOT_FOUND`)
  - `MembershipNotActive` (`DOMAIN`)
  - `InvalidRoleTransition` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `CannotModifyOwnerRole` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `TransferOwnership`

- **Errors:**
  - `OrganizationArchived` (`DOMAIN`)
  - `TargetNotAdmin` (`DOMAIN`)
  - `MembershipNotActive` (`DOMAIN`)
  - `OwnershipLimitReached` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `ConcurrentModification` (`CONCURRENCY`)

---

### Membership Commands

#### Command: `AcceptInvitation`

- **Errors:**
  - `InvitationNotFound` (`NOT_FOUND`)
  - `InvitationExpired` (`DOMAIN`)
  - `MembershipAlreadyExists` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `SuspendMembership`

- **Errors:**
  - `MembershipNotFound` (`NOT_FOUND`)
  - `MembershipAlreadySuspended` (`DOMAIN`)
  - `CannotSuspendOwner` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `ConcurrentModification` (`CONCURRENCY`)

#### Command: `RestoreMembership`

- **Errors:**
  - `MembershipNotFound` (`NOT_FOUND`)
  - `MembershipNotSuspended` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `RemoveMember`

- **Errors:**
  - `MembershipNotFound` (`NOT_FOUND`)
  - `MembershipAlreadyRemoved` (`DOMAIN`) _(Idempotent – treated as success)_
  - `CannotRemoveOwner` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `ConcurrentModification` (`CONCURRENCY`)

---

### Invitation Commands

#### Command: `CreateInvitation`

- **Errors:**
  - `OrganizationArchived` (`DOMAIN`)
  - `InvitationAlreadyExists` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)
  - `InvalidInvitationTarget` (`VALIDATION`)

#### Command: `AcceptInvitation`

- **Errors:** _(See Membership Commands section above)_

### Team Commands

#### Command: `CreateTeam`

- **Errors:**
  - `OrganizationArchived` (`DOMAIN`)
  - `TeamNameAlreadyExists` (`DOMAIN`)
  - `TeamLimitReached` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `ArchiveTeam`

- **Errors:**
  - `TeamNotFound` (`NOT_FOUND`)
  - `TeamAlreadyArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `RestoreTeam`

- **Errors:**
  - `TeamNotFound` (`NOT_FOUND`)
  - `TeamNotArchived` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

---

### TeamMembership Commands

#### Command: `AddTeamMember`

- **Errors:**
  - `MembershipNotActive` (`DOMAIN`)
  - `TeamMembershipAlreadyExists` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `RemoveTeamMember`

- **Errors:**
  - `TeamMembershipNotFound` (`NOT_FOUND`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `ChangeTeamRole`

- **Errors:**
  - `TeamMembershipNotFound` (`NOT_FOUND`)
  - `InvalidRoleTransition` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

---

### Project Commands

#### Command: `CreateProject`

- **Errors:**
  - `OrganizationArchived` (`DOMAIN`)
  - `TeamNotFound` (`NOT_FOUND`)
  - `ProjectLimitReached` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `ArchiveProject`

- **Errors:**
  - `ProjectNotFound` (`NOT_FOUND`)
  - `ProjectAlreadyArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `RestoreProject`

- **Errors:**
  - `ProjectNotFound` (`NOT_FOUND`)
  - `ProjectNotArchived` (`DOMAIN`)
  - `OrganizationArchived` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

---

### ProjectMembership Commands

#### Command: `AddProjectMember`

- **Errors:**
  - `MembershipNotActive` (`DOMAIN`)
  - `ProjectMembershipAlreadyExists` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `RemoveProjectMember`

- **Errors:**
  - `ProjectMembershipNotFound` (`NOT_FOUND`)
  - `PermissionDenied` (`AUTHORIZATION`)

#### Command: `ChangeProjectRole`

- **Errors:**
  - `ProjectMembershipNotFound` (`NOT_FOUND`)
  - `InvalidRoleTransition` (`DOMAIN`)
  - `PermissionDenied` (`AUTHORIZATION`)

---

### Profile & Preferences Commands

#### Command: `ChangeUserDisplayName`

- **Errors:**
  - `UserNotActive` (`DOMAIN`)
  - `InvalidDisplayName` (`VALIDATION`)

---

## 3. Key Operational Patterns

### 1. Idempotency Handling

- Errors representing target state alignment (e.g., `MembershipAlreadyRemoved`, `SessionAlreadyRevoked`) must be treated as **Soft Errors** and resolved as a **Success (200 OK / No-Op)**.

### 2. Mandatory Concurrency Enforcement

- Include `ConcurrentModification` (`CONCURRENCY`) checks on state mutations involving:
  - Ownership transfers
  - Membership state transitions
  - Aggregated count updates (e.g., `activeProjectCount`, `ownershipCount`)

### 3. Clear Auth vs. Domain Separation

- Maintain strict boundaries between access rights and domain logic invariants:
  - **Authorization Error:** `PermissionDenied` (Actor lacks permission to invoke action).
  - **Domain Error:** `CannotRemoveOwner` (Action fails business invariant rules regardless of permission).
