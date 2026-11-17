import { Box } from "@mui/material";
import { Outlet } from "react-router";

import { TopBar } from "../components/TopBar";

export function AuthenticatedLayout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopBar />
      <Outlet />
    </Box>
  );
}
