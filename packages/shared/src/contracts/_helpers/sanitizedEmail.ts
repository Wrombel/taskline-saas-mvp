import { z } from "zod";
export const sanitizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());
