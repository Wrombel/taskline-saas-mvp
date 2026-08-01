import { useForm, Controller } from "react-hook-form";
import { Form, useSubmit, useNavigation, useActionData } from "react-router";
import { Container, TextField, Button, Alert } from "@mui/material";
import type { LoginFormData } from "../../types/types";

export default function LoginPageV2() {
  const submit = useSubmit();
  const navigation = useNavigation();

  // Pobieranie błędów zwróconych bezpośrednio z funkcji action w routerze
  const actionData = useActionData() as { error?: string } | undefined;

  const { control, handleSubmit } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  // Flaga isSubmitting sterowana jest teraz przez globalny stan nawigacji React Routera
  const isSubmitting = navigation.state === "submitting";

  const onSubmit = (data: LoginFormData) => {
    // Ręcznie przekazujemy dane z React Hook Form do mechanizmu Actions z React Routera
    submit(data as any, { method: "post" });
  };

  return (
    <Container maxWidth="xs">
      {actionData?.error && <Alert severity="error">{actionData.error}</Alert>}

      {/* Używamy komponentu Form z React Router v7 */}
      <Form method="post" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="email"
          control={control}
          rules={{ required: "Email jest wymagany" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              margin="normal"
              fullWidth
              label="Email"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />

        {/* ... analogicznie pole password ... */}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </Form>
    </Container>
  );
}
