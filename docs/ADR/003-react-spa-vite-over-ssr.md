## ADR 003: Selection of React SPA (Vite) over SSR (Next.js/Remix)

### Status

Accepted

### Context

We needed to define the client-side rendering architecture for an interactive B2B SaaS platform. We evaluated whether to build a Server-Side Rendered (SSR) client using frameworks like Next.js or Remix versus a classic Single Page Application (SPA).

### Decision

We chose to build a classic **Single Page Application (SPA)** using **React** bundled with **Vite**, rather than leveraging Server-Side Rendering (SSR). Because the platform is an authenticated, gated SaaS application where users perform highly interactive tasks after logging in, client-side execution provides optimal user responsiveness and operational simplicity.

### Consequences

- **Positive:**
  - **Rich UX:** Desktop-like responsiveness and smooth transitions after loading the initial bundle.
  - **Server Offloading:** Moves UI rendering workloads entirely to the user's browser, reducing backend server resource consumption and operational costs.
  - **Simplified Deployment:** Static asset distribution via CDN with simplified CI/CD pipelines.
- **Negative:**
  - **Reduced SEO Capabilities:** Less suitable for public search engine indexing, though this compromise is negligible for an internal authenticated SaaS application.
