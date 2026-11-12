import { useMutation } from "@tanstack/react-query";
import type { RegisterRequestSchema } from "@project/shared";

import { api } from "@/shared/api/api";

async function register(data: RegisterRequestSchema) {
  await api.post("/auth/register", data);
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}
