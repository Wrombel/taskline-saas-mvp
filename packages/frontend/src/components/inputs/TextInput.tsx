import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import type { UseControllerProps, FieldValues } from "react-hook-form";
import type { TextFieldProps } from "@mui/material";
type FormTextFieldProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextFieldProps, "name">;

export function FormTextField<T extends FieldValues>({
  name,
  control,
  rules,
  ...props
}: FormTextFieldProps<T>) {
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
