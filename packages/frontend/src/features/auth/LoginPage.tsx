import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { LoginFormData } from "../../types/types";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      // Tutaj logika API, np. await authService.login(data)
      console.log("Dane logowania:", data);

      // Po pomyślnym logowaniu przekieruj użytkownika
      navigate("/dashboard");
    } catch (error: any) {
      setApiError(error?.message || "Nieprawidłowy e-mail lub hasło.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Typography>Zaloguj się</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Witaj ponownie! Wprowadź swoje dane.
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ width: "100%" }}
          >
            {/* Pole Email */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Adres e-mail jest wymagany",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Niepoprawny adres e-mail",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adres e-mail"
                  autoComplete="email"
                  autoFocus
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Pole Hasło */}
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Hasło jest wymagane",
                minLength: {
                  value: 6,
                  message: "Hasło musi mieć co najmniej 6 znaków",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Hasło"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  error={!!error}
                  helperText={error?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="zmień widoczność hasła"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            {/* Przycisk Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.2 }}
            >
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </Button>

            {/* Linki nawigacyjne */}
            <Box>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                underline="hover"
              >
                Zapomniałeś hasła?
              </Link>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                underline="hover"
              >
                Nie masz konta? Zarejestruj się
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
