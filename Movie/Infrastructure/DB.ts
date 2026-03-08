import pkg from "pg";
import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env file explicitly for ESM projects
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { Pool } = pkg;

// Validation Zod des variables d'environnement
const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => {
    const n = Number(val);
    if (isNaN(n)) throw new Error("DB_PORT doit être un nombre");
    return n;
  }),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

// Parse et récupère les valeurs validées
const env = envSchema.parse(process.env);

// Création du pool PostgreSQL
export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

pool.on("error", (err) => {
  console.error("Erreur inattendue du pool PostgreSQL :", err);
  process.exit(-1);
});

console.log("Pool PostgreSQL prêt !");
