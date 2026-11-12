import { TextField, type TextFieldProps } from "@mui/material";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";

type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "defaultValue" | "error" | "helperText"
> & {
  control: Control<T>;
  name: Path<T>;
};

export function FormTextField<T extends FieldValues>({ control, name, ...props }: FormTextFieldProps<T>) {
  const {
    field: { ref, value, ...field },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <TextField
      {...props}
      {...field}
      value={value ?? ""}
      inputRef={ref}
      error={!!error}
      helperText={error?.message}
      fullWidth
    />
  );
}
