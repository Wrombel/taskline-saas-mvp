import { Outlet } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

export function RootLayout() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  );
}
