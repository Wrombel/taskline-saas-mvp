import type { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { createBrowserRouter } from "react-router";

import { api } from "./api";

type Router = ReturnType<typeof createBrowserRouter>;

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/me"];

export function setupApiInterceptors(queryClient: QueryClient, router: Router) {
  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        const url = error.config?.url ?? "";
        if (!AUTH_PATHS.some((path) => url.startsWith(path))) {
          queryClient.clear();
          void router.navigate("/login");
        }
      }
      return Promise.reject(error);
    },
  );
}
