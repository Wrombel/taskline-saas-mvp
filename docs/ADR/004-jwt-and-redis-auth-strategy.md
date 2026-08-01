## ADR 004: Selection of Server-Side State as Source of Truth for Authentication (Session-Based Model)

### Status

Accepted

### Context

The application requires a secure authentication and session management model where authorization scope and active user context change dynamically (e.g., switching between projects, real-time role modifications, and granular project permissions).

We evaluated whether the source of truth for authentication should reside on the client via stateless tokens (JWT) or on the server via stateful sessions:

- **Stateless Tokens (JWT):** Prefer static or rarely changing context, as claims are baked into the token payload itself. Revoking sessions, handling real-time project context changes, or invalidating compromised tokens in a JWT architecture introduces significant complexity and risk of stale permission states.
- **Server-Side Sessions:** Keep full control over the session state on the backend, ensuring that any authorization or project context change takes effect immediately on subsequent requests.

### Decision

We decided that the **Server-Side State** will be the single source of truth for authentication and session management. We explicitly reject the use of JSON Web Tokens (JWT) in this project.

Key implementation details:

- **Session-Based Model:** All user authentication state, permissions, and active project contexts are stored and validated strictly on the server side.
- **Opaque Tokens:** Authentication relies on a simple, randomly generated opaque token that contains no readable payload or embedded metadata.
- **Secure Cookie Storage:** The opaque token is delivered and transmitted exclusively via `HttpOnly`, `Secure`, `SameSite=Strict` HTTP cookies. Client-side JavaScript has zero access to the token, protecting it from XSS attacks.
- **Single Active Token per Device:** Exactly one opaque session token exists on a given device at any single point in time.

### Consequences

- **Positive:**
  - **Instant Context & Permission Updates:** Dynamic changes to project assignments or user roles are reflected instantly across requests without relying on token expiration or token blacklist mechanisms.
  - **Stronger Security Boundary:** Opaque tokens reveal no user data or system structure if intercepted, and storing them in `HttpOnly` cookies completely mitigates token exposure to client-side scripts (XSS).
  - **Reduced Architecture Complexity:** Eliminates JWT-specific challenges, such as handling compromised secret keys, complex token rotation algorithms, and stale authorization claims.
- **Negative:**
  - **Server-Side Storage Dependency:** Requires direct lookups against a fast server-side session store (e.g., Redis or database) for every incoming authenticated request.
  - **Horizontal Scaling Overhead:** Backend services must share access to a centralized session store to validate user requests across multiple instances.
