import { createBrowserRouter } from "react-router";

import { RootLayout } from "./layouts/RootLayout";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { RouteError } from "./components/RouteError";
import { guestOnly, requireAuth } from "@/features/identity/guards";
import { queryClient } from "@/shared/lib/queryClient";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // tylko dla niezalogowanych
      {
        loader: guestOnly(queryClient),
        children: [
          {
            path: "login",
            lazy: async () => {
              const { LoginPage } = await import("../features/identity/login/LoginPage");
              return { Component: LoginPage };
            },
          },
          {
            path: "register",
            lazy: async () => {
              const { RegisterPage } = await import("../features/identity/register/RegisterPage");
              return { Component: RegisterPage };
            },
          },
        ],
      },
      // tylko dla zalogowanych
      {
        loader: requireAuth(queryClient),
        element: <AuthenticatedLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import("../features/tenant/HomePage");
              return { Component: HomePage };
            },
          },
          // kolejne chronione trasy...
        ],
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("./components/NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
