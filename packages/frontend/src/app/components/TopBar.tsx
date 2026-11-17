import { useState } from "react";
import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import Logout from "@mui/icons-material/Logout";
import { useQuery } from "@tanstack/react-query";

import { sessionQueryOptions } from "@/features/identity/api/session";
import { useLogout } from "@/features/identity/api/useLogout";

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

export function TopBar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: user } = useQuery(sessionQueryOptions);
  const logout = useLogout();
  const menuOpen = Boolean(anchorEl);
  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar sx={{ minHeight: 64, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
          <Box aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Workspace
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, mr: 1.5 }}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <IconButton
          aria-label="Otwórz menu użytkownika"
          aria-controls={menuOpen ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="small"
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>
            {user ? getInitials(user.firstName, user.lastName) : <AccountCircleOutlined />}
          </Avatar>
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem
            disabled={logout.isPending}
            onClick={() => {
              setAnchorEl(null);
              logout.mutate();
            }}
          >
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            Wyloguj się
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
