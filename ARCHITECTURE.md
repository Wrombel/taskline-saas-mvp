# System Architecture

The project utilizes a modern approach to software architecture, combining **Domain-Driven Design (DDD)** concepts and a simplified **CQRS (CQRS Light)** in a Node.js/React environment.

The architectural documentation is divided according to the **C4 Model** standard, allowing for system exploration at various levels of detail:

### 🗺️ [Level 1: System Context & Domains](./docs/architecture/01-system-context.md)

Describes the main business contexts (Bounded Contexts) such as Identity, Collaboration, or Tenant Management, without diving into technology.

### 📦 [Level 2: Container Architecture](./docs/architecture/02-containers.md)

Shows the physical runtime containers: SPA, API Server (Express), asynchronous workers, and databases (MongoDB, Redis).

### ⚙️ [Level 3: Component Architecture (API)](./docs/architecture/03-components.md)

The lowest level of documentation. It explains the internal API structure, showing flows for Write operations (Command Handlers) and Read operations (Query Handlers bypassing the domain).
