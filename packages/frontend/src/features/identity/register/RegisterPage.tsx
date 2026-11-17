import { useState } from "react";
import { Box, Button, IconButton, InputAdornment, Link, Paper, Stack, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterRequestSchema } from "@project/shared";
import { isAxiosError } from "axios";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router";

import { FormTextField } from "@/shared/ui/forms/FormTextField";
import { useRegister } from "./useRegister";

export function RegisterPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useRegister();

  const { control, handleSubmit, setError } = useForm<RegisterRequestSchema>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    // values to już wynik parsowania schematu (email po trim + lowercase)
    mutate(values, {
      onSuccess: () => {
        enqueueSnackbar("Konto utworzone. Zalogowano.", { variant: "success" });
        void navigate("/");
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setError("email", {
            message: "Konto z tym adresem e-mail już istnieje",
          });
          return;
        }
        enqueueSnackbar("Nie udało się utworzyć konta. Spróbuj ponownie.", {
          variant: "error",
        });
      },
    });
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 440, p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Załóż konto
        </Typography>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormTextField control={control} name="firstName" label="Imię" autoComplete="given-name" />
              <FormTextField control={control} name="lastName" label="Nazwisko" autoComplete="family-name" />
            </Stack>

            <FormTextField control={control} name="email" label="E-mail" type="email" autoComplete="email" />

            <FormTextField
              control={control}
              name="password"
              label="Hasło"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button type="submit" variant="contained" size="large" loading={isPending}>
              Zarejestruj się
            </Button>

            <Typography variant="body2" align="center">
              Masz już konto?{" "}
              <Link component={RouterLink} to="/login">
                Zaloguj się
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
