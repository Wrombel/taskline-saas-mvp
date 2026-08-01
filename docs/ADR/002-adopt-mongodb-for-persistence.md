## ADR 002: Selection of MongoDB as Primary Database Solution

### Status

Accepted

### Context

The application requires a reliable persistence storage mechanism across different Bounded Contexts. It needs to accommodate evolving domain models, support complex domain aggregates natively, and provide fast read performance for CQRS projections.

### Decision

We selected **MongoDB** over traditional relational databases (such as PostgreSQL). MongoDB's document-oriented storage aligns naturally with Domain-Driven Design (DDD) aggregates, allowing entire domain objects to be persisted and retrieved as single documents without complex ORM mappings or object-relational impedance mismatch. Additionally, it offers schema flexibility during rapid domain modeling iterations.

### Consequences

- **Positive:**
  - **Simplified Mapping:** Direct persistence of complex domain aggregates without multi-table normalization or ORM mapping friction.
  - **Read Model Efficiency:** Documents can be structured to directly serve CQRS query responses.
  - **Schema Flexibility:** High adaptability during early product iterations when domain boundaries are continuously refined.
- **Negative:**
  - **Lack of Native JOINs:** Requires data denormalization across read models or multiple queries to gather data from different collections.
  - **Consistency Management:** Application-level logic is required to maintain eventual consistency across related documents and contexts.
