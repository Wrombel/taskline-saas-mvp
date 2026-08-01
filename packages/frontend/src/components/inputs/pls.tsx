import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import type { UseControllerProps, FieldValues } from "react-hook-form";
import type { TextFieldProps } from "@mui/material";
// Typujemy propsy: bierzemy zasady kontrolera (np. name, rules) i łączymy z propsami TextField z MUI
type FormTextFieldProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextFieldProps, "name">;

export function FormTextField<T extends FieldValues>({
  name,
  rules,
  ...props
}: FormTextFieldProps<T>) {
  // Pobieramy control automatycznie z kontekstu rodzica
  const context = useFormContext<T>();

  if (!context) {
    throw new Error(
      "Komponent <FormTextField /> musi być używany wewnątrz <FormContainer /> lub <FormProvider />",
    );
  }

  const { control } = context;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error ? error.message : props.helperText}
        />
      )}
    />
  );
}
