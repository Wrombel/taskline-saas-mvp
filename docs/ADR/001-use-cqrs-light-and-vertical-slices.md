## ADR 001: Selection of CQRS Light and Vertical Slice Architecture

### Status

Accepted

### Context

Standard Express.js applications traditionally rely on a layered Model-View-Controller (MVC) architecture or monolithic service layers. As domain complexity grows, this setup frequently leads to "fat services" (God objects), where business logic, data persistence, and orchestration become tightly coupled, difficult to maintain, and hard to test in isolation.

### Decision

We decided to adopt a feature-oriented structure based on **Vertical Slice Architecture** combined with a **CQRS Light** (Command Query Responsibility Segregation) pattern. Instead of horizontal layers spanning the entire application, code is organized into self-contained slices per feature, split strictly into:

- **Command Handlers:** For handling state mutations and domain execution.
- **Query Handlers:** For optimized read/data retrieval operations.

This approach gives us the isolation benefits of CQRS without the unnecessary overhead of separate read/write physical databases or Event Sourcing.

### Consequences

- **Positive:**
  - **High Cohesion:** Code is organized around business Use Cases rather than technical layers.
  - **Easier Testing:** Each handler operates independently, making unit and integration testing straightforward.
  - **Lower Regression Risk:** Modifying or extending a specific feature slice has minimal side effects on other parts of the system.
- **Negative:**
  - **Boilerplate Overhead:** Requires creating dedicated files for controllers, handlers, input validation schemas, and types for every individual slice.
