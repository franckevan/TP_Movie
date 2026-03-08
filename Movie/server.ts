// Point d’entrée HTTP (à implémenter)
//
// Objectif :
// - GET /movies
// - GET /movies/:id/screenings
//
// Utiliser :
// - `node:http`
// - `sendJson` / `sendError` depuis `Server/http.ts`
// - les repositories depuis `Infrastructure/`

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { router } from "./router.js";

const PORT = 3003;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});