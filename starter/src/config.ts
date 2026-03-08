import { z } from "zod";

export const EnvSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export const env = EnvSchema.parse(process.env);

