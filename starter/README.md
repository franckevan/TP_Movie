# package.json 

```json
{
  "name": "node-ts",
  "version": "1.0.0",
  "type": "module",
  "packageManager": "pnpm@10.11.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --watch --pretty --noEmit"
  },
  "dependencies": {
    "pg": "^8.18.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "tsx": "^4.21.0",
    "@types/node": "^25.2.3",
    "@types/pg": "^8.16.0"
  }
}
```

Puis :

```bash
pnpm install
```

---

# tsconfig.json 

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": "src",
    "outDir": "dist",

    "strict": true,
    "types": ["node"],
    "lib": ["ES2022"],

    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

# Structure minimale recommandée

```
src/
 ├── server.ts
 ├── db.ts
 └── config.ts
```

---

# src/config.ts

```ts
import { z } from "zod";

const EnvSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export const env = EnvSchema.parse(process.env);
```

👉 Validation runtime propre dès le démarrage.

---

# src/db.ts

```ts
import { Pool } from "pg";
import { env } from "./config";

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});
```

---

#  src/server.ts (HTTP + test DB)

```ts
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { pool } from "./db";

/**
 * Helper pour envoyer du JSON typé.
 */
function sendJson<T>(
  res: ServerResponse,
  status: number,
  data: T
): void {
  res.writeHead(status, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}

/**
 * Router simple typé.
 */
async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {

  const method: string = req.method ?? "GET";
  const rawUrl: string = req.url ?? "/";
  const path: string = rawUrl.split("?", 2)[0] ?? "/";

  if (method === "GET" && path === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (method === "GET" && path === "/db") {
    const result = await pool.query<{ now: string }>(
      "SELECT NOW() AS now"
    );

    return sendJson(res, 200, result.rows[0]);
  }

  return sendJson(res, 404, { error: "Not Found" });
}

/**
 * Serveur HTTP typé.
 */
const server = createServer(handler);

server.listen(3000, "0.0.0.0", (): void => {
  console.log("Server running on http://localhost:3000");
});
```

---

# Dockerfile (pnpm propre)

```dockerfile
FROM node:24-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

---

#  docker-compose.yml (HTTP + Postgres)

```yaml
services:
  app:
    build: .
    container_name: node-ts
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    command: pnpm dev
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: db

  postgres:
    image: postgres:17-alpine
    container_name: db-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: db
    ports:
      - "5434:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

---

# .dockerignore

```
node_modules
dist
.git
```

---

# 🚀 Lancer

```bash
docker compose build --no-cache
docker compose up -d
```

---

# Tester

```
http://localhost:3000
http://localhost:3000/health
http://localhost:3000/db
```
