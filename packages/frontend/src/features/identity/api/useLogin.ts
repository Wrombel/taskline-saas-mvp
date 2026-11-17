import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginRequestSchema } from "@project/shared";

import { api } from "@/shared/api/api";
import { sessionQueryOptions } from "./session";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequestSchema) => api.post("/auth/login", data),
    onSuccess: () => {
      // The command establishes the cookie; the auth guard loads the profile via /auth/me.
      queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey });
    },
  });
}
