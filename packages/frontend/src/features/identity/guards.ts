import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router";

import { sessionQueryOptions } from "./api/session";

export const requireAuth = (queryClient: QueryClient) => async () => {
  const user = await queryClient.ensureQueryData(sessionQueryOptions);
  if (!user) throw redirect("/login");
  return null;
};

export const guestOnly = (queryClient: QueryClient) => async () => {
  const user = await queryClient.ensureQueryData(sessionQueryOptions);
  if (user) throw redirect("/");
  return null;
};
