import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { router } from "@movie/router";
const PORT = Number(process.env.PORT ?? 3000);

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  await router(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`http://localhost:${PORT}`);
});
