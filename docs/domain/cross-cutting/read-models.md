# Read Models Documentation

## 1. Overview

Read Models (the query side) are denormalized data structures specifically optimized for UI and API consumption.
**TL;DR:** Read models are designed to enable fast queries and are **not** the source of truth in the system.

## 2. System Architecture

Our system maintains a strict and clear separation between write and read operations:

- **Write Model:** Normalized data structures (MongoDB collections).
- **Read Model:** Aggregated, denormalized views tailored for specific access patterns.

---

## 3. Proposed Read Models

### 3.1. UserOrganizationsView

Aggregates user data with their associated organizations.

- **Sources:** `Membership` + `Organization`

```json
{
  "userId": "...",
  "organizations": [
    {
      "organizationId": "...",
      "name": "...",
      "role": "Owner|Admin|Member",
      "state": "Active|Suspended",
      "memberCount": 12
    }
  ]
}
```

### 3.2. OrganizationMembersView

Displays all members associated with a specific organization.

```json
{
  "organizationId": "...",
  "members": [
    {
      "userId": "...",
      "email": "...",
      "role": "Admin",
      "state": "Active"
    }
  ]
}
```

### 3.3. TeamView

Aggregates team details, including its assigned members and projects.

```json
{
  "teamId": "...",
  "organizationId": "...",
  "members": [...],
  "projects": [...]
}
```

### 3.4. ProjectView

Represents a project, its parent team and organization, along with member roles.

```json
{
  "projectId": "...",
  "teamId": "...",
  "organizationId": "...",
  "members": [...],
  "role": "ProjectAdmin"
}
```

### 3.5. SessionContextView

Holds the current active session state, context, and permissions for a user.

```json
{
  "sessionId": "...",
  "userId": "...",
  "activeOrganization": "...",
  "permissions": [...]
}
```

---

## 4. Update Strategies

There are two primary approaches for keeping read models synchronized with the write models:

### Option A: Synchronous (Sync)

Updates the read model within the exact same transaction as the write operation.

- **✔ Pros:** Simpler to implement.
- **❌ Cons:** Less scalable, increases transaction times and locks.

### Option B: Event-Driven (Better Architecture)

Emits an event after a write operation, which then triggers an asynchronous update to the read model.

- **✔ Pros:** Highly scalable.
- **✔ Pros:** Aligns properly with CQRS (Command Query Responsibility Segregation) principles.

---

## 5. Core Principles

When working with read models in this system, the following rules apply:

1. **Eventual Consistency is OK:** Read models can be eventually consistent. Immediate consistency is not required.
2. **Fully Rebuildable:** Read models are disposable and can be entirely rebuilt from events or the primary database at any time.
3. **No Domain Logic:** You must **never** validate business invariants on the read model. All business rules and validations belong strictly to the Write Model.
