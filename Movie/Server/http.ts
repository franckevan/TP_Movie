import type { ServerResponse } from "node:http";

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, status: number, message: string) {
  return sendJson(res, status, { ok: false, error: message });
}

