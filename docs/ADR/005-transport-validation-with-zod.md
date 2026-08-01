## ADR 005: Transport-Level Input Validation using Zod Middleware

### Status

Accepted

### Context

Incoming HTTP payloads contain untrusted data that must be syntactically and structurally validated before reaching business logic or domain entities.

### Decision

We implemented transport-level data validation using **Zod** schemas running as HTTP controller middleware. Command and Query Handlers strictly operate under the contract that all incoming Data Transfer Objects (DTOs) have already been sanitized, typed, and validated prior to invocation.

### Consequences

- **Positive:**
  - **End-to-End Type Safety:** Automatic TypeScript inference from Zod schemas ensures complete alignment between validation and static typing.
  - **Fail-Fast Boundary:** Invalid requests are rejected early at the HTTP transport layer, keeping domain handlers clean of primitive checks and manual parsing.
  - **Clear Error API:** Provides structured, declarative error payloads to clients on validation failures.
- **Negative:**
  - **Library Coupling:** Couples request payload schemas to Zod syntax.
  - **Schema Duplication Risk:** Care must be taken not to duplicate core domain validation logic inside transport-level schemas.
