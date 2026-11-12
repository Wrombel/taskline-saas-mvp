import { useState } from "react";
import { Box, Button, IconButton, InputAdornment, Link, Paper, Stack, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestSchema } from "@project/shared";
import { isAxiosError } from "axios";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router";

import { FormTextField } from "@/shared/ui/forms/FormTextField";
import { useLogin } from "../api/useLogin";

export function LoginPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();

  const { control, handleSubmit, setError } = useForm<LoginRequestSchema>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: () => {
        void navigate("/");
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          setError("password", { message: "Nieprawidłowy e-mail lub hasło" });
          return;
        }
        enqueueSnackbar("Nie udało się zalogować. Spróbuj ponownie.", { variant: "error" });
      },
    });
  });

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 440, p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Zaloguj się
        </Typography>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <FormTextField control={control} name="email" label="E-mail" type="email" autoComplete="email" />

            <FormTextField
              control={control}
              name="password"
              label="Hasło"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        onClick={() => setShowPassword((previous) => !previous)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button type="submit" variant="contained" size="large" loading={isPending}>
              Zaloguj się
            </Button>

            <Typography variant="body2" align="center">
              Nie masz jeszcze konta?{" "}
              <Link component={RouterLink} to="/register">
                Zarejestruj się
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
