import type { AuthContext } from "../../modules/identity/authenticate/auth-context.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
