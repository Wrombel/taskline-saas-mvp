import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginRequestSchema } from "@project/shared";

import { api } from "@/shared/api/api";
import { sessionQueryOptions, type SessionUser } from "./session";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequestSchema) => {
      const { data: user } = await api.post<SessionUser>("/auth/login", data);
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, user);
    },
  });
}
