import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RegisterRequestSchema } from "@project/shared";

import { api } from "@/shared/api/api";
import { sessionQueryOptions } from "../api/session";

async function register(data: RegisterRequestSchema) {
  await api.post("/auth/register", data);
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      // Registration establishes a session; let the auth guard load its profile via /auth/me.
      queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey });
    },
  });
}
