import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { api } from "@/shared/api/api";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    // onSettled, nie onSuccess: lokalny stan czyścimy nawet gdy request się nie uda
    onSettled: () => {
      queryClient.clear();
      void navigate("/login");
    },
  });
}
