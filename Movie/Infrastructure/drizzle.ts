import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "./DB.js";
import * as schema from "./schema.js";

// Instance client Drizzle
export const db = drizzle(pool, { schema });

export { schema };

