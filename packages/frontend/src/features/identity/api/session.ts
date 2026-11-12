import { queryOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { api } from "@/shared/api/api";

// Jeśli masz DTO użytkownika w @project/shared, zaimportuj je stamtąd.
export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async (): Promise<SessionUser | null> => {
    try {
      const { data } = await api.get<SessionUser>("/auth/me");
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      if (isAxiosError(error) && error.response?.status === 401) return null;
      throw error;
    }
  },
  staleTime: 5 * 60_000,
  retry: false,
});
