# Audit Documentation

## 1. Purpose

The primary goal of the audit log is to maintain a complete and immutable history of changes within the system. It answers the fundamental questions: **Who** did **what**, **when**, and **where**?

---

## 2. What to Log (Key Areas for Your System)

The following events are critical to track, tailored specifically to your system's model:

### 2.1 Identity & Access (Most Important)

- `Login` / `Logout`
- `Password change`
- `Email change`
- `Session revoke`

### 2.2 Organization Lifecycle

- `OrganizationCreated`
- `OrganizationArchived`
- `OrganizationRestored`
- `OwnershipTransferred`

### 2.3 Membership

- `MembershipCreated`
- `MembershipSuspended`
- `MembershipRemoved`
- `RoleChanged`

### 2.4 Invitations

- `InvitationCreated`
- `InvitationAccepted`
- `InvitationExpired`

### 2.5 Security-Sensitive

- `Failed login attempts`
- `PermissionDenied` (optional)

---

## 3. Audit Structure

The data structure for an audit log entry should be structured as follows:

```json
{
  "eventId": "...",
  "eventType": "MembershipRemoved",
  "timestamp": "...",
  "actorId": "...",
  "targetId": "...",
  "organizationId": "...",
  "metadata": {
    "oldRole": "Admin",
    "newRole": "Member"
  },
  "correlationId": "...",
  "requestId": "...",
  "ipAddress": "...",
  "userAgent": "..."
}
```

_(Note: Fields like `correlationId`, `requestId`, `ipAddress`, and `userAgent` are excellent additions for a robust system.)_

---

## 4. Audit Source & Flow

The recommended approach is to derive audit logs directly from system events:
**Events → Audit Log**

The flow is:
`emit event` → `save to audit collection`

---

## 5. Core Principles

When working with the Audit system, adhere to these strict rules:

1.  **Immutable:** The audit log is completely immutable.
2.  **No Updates:** You must never update existing entries.
3.  **Append-Only:** New entries are only ever appended to the log.

---

## 6. Retention Policy

For the purposes of this portfolio project, the retention policy is simple:

- **No deletion / Infinite retention**

---

## 7. TL;DR & Architectural Fit

**Audit = Event record + Metadata + Actor details**

Because you have a very mature model, the components interact as follows:

- **System Processes:** Ensure consistency and security (e.g., TTL, membership management, session handling).
- **Read Models:** Aggregate data from Membership, Organization, Team, and Project to serve fast queries.
- **Audit:** Logs every action that mutates access control or system state.
