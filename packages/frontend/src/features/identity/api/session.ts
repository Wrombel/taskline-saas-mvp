import { queryOptions } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { GetUserProfile } from "@project/shared";
import { api } from "@/shared/api/api";

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async (): Promise<GetUserProfile | null> => {
    try {
      const { data } = await api.get<GetUserProfile>("/auth/me");
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) return null;
      throw error;
    }
  },
  staleTime: 5 * 60_000,
  retry: false,
});
