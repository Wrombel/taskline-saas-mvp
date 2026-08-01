# Authorization & Permission Specification

## 0. Overview & Model

This section defines the authorization framework bridging **Actors** (who), **Commands** (what actions are attempted), and **Aggregates/Resources** (what target is being acted upon).

The permission model enforces the evaluation contract:

$$\text{can}(\text{actor}, \text{action}, \text{resource})$$

### Naming Conventions

Permissions are formatted using the dot-notation convention: `<resource>.<action>`

- **Wildcard (`*`):** Represents full administrative bypass or all actions for a specific resource scope (e.g., `task.*` denotes all task-related permissions).
- **Self-Scope:** Denotes permissions restricted exclusively to the actor's own resource instance.

---

## 1. Role-to-Permission Mappings

### Organization Permissions (Tenant Domain)

### **OrgOwner**

- **Permissions:** `organization.*`, `membership.*`, `invitation.*`, `team.*`, `project.*`, `ownership.transfer`
- **Scope:** Full system bypass across all organization resources.

### **OrgAdmin**

- **Permissions:** `organization.read`, `membership.read`, `membership.suspend`, `membership.restore`, `membership.remove`, `membership.changeRole`, `invitation.create`, `team.create`, `team.archive`, `team.restore`
- **Scope:** Administrative access excluding ownership transfer and owner removal.

### **OrgMember**

- **Permissions:** `organization.read`, `membership.read` (self), `project.read` (assigned), `team.read` (assigned), `invitation.accept`, `organization.leave`
- **Scope:** Base access for standard organization members.

---

### Team Permissions (Collaboration Domain)

#### `TeamAdmin`

- `team.read`, `team.update`, `team.archive`, `team.restore`
- `teamMembership.add`, `teamMembership.remove`, `teamMembership.changeRole`
- `project.create`, `project.read`

#### `TeamMember`

- `team.read`
- `project.read` _(assigned/inherited)_

---

### Project Permissions (Collaboration Domain)

#### `ProjectAdmin`

- `project.read`
- `project.archive` _(restricted to owning team context)_
- `project.restore` _(restricted to owning team context)_
- `projectMembership.add`, `projectMembership.remove`, `projectMembership.changeRole`
- `task.*`
- `board.*`

#### `ProjectContributor`

- `project.read`
- `task.create`, `task.update`, `task.move`
- `board.read`

#### `ProjectViewer`

- `project.read`
- `task.read`
- `board.read`

---

## 2. Cross-Cutting Authorization Rules

These rules enforce global invariants across all domains that cannot be expressed purely through static role-permission mappings:

### 1. Organization Boundary

An Actor can execute actions **only** within organizations where their `Membership.state == Active`.

### 2. Archived Resources Limit

If `Organization.archived == true`, **all write operations** (`create`, `update`, `delete`, `archive`, `restore`) across all nested resources (Teams, Projects, Tasks) are strictly forbidden.

### 3. Suspended Membership Lockdown

If `Membership.state == Suspended`, all permissions are revoked immediately regardless of assigned roles.

### 4. Owner Constraints

- Only the `OrgOwner` can initiate an `ownership.transfer`.
- An `OrgOwner` membership cannot be suspended or removed without prior ownership transfer.
- `Organization` must always have exactly one `OrgOwner`

### 5. Session Context Requirement

An active `TenantBound` session is required to execute any command within an organization boundary.

### 6. Self-Action Limitations

- **Allowed Self-Actions:** A user can independently invoke `organization.leave` or update their own profile (`userProfile.update`).
- **Forbidden Self-Actions:** A user **cannot** modify their own role (`membership.changeRole`, `teamMembership.changeRole`, `projectMembership.changeRole`).

### 7. Project Privacy & Automatic Role Inheritance

Projects are **private by default**. Only users explicitly included in a project's `accessGrant` / `ProjectMembership` can perform actions (excluding `OrgOwner` bypass).

Upon project creation:

- The creator is automatically granted the `ProjectAdmin` role.
- Every `TeamMember` of the owning team inherits the `ProjectContributor` role for that project.

### 8. CrossAgregate invariants

- User cannot own more than MAX_OWNED_ORGANIZATIONS
- Team.organizationId must equal Project.organizationId
- Project is owned exactly by 1 team
- TeamMembership requires existing active Organization Membership
