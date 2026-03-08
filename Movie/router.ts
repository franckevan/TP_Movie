import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJson, sendError } from "./Server/http.js";
import { MovieRepository } from "./Infrastructure/MovieRepository.js";
import { ScreeningRepository } from "./Infrastructure/ScreeningRepository.js";
import { z } from "zod";

const MovieIdSchema = z.coerce.number().int().positive();

const CreateUpdateMovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional().transform(v => v ?? null),
  durationMinutes: z.number().int().positive(),
  rating: z.string().nullable().optional().transform(v => v ?? null),
  releaseDate: z.string().nullable().optional().transform(v => v ?? null),
});

const PatchMovieSchema = CreateUpdateMovieSchema.partial();

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(!body.trim() ? {} : JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function router(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";
  const [pathname = "/"] = url.split("?");
  const segments = pathname.split("/").filter(Boolean);

  const idParse = segments[1] ? MovieIdSchema.safeParse(segments[1]) : null;
  const hasId = idParse?.success;
  const movieId = hasId ? idParse!.data : undefined;

  const sendBodyError = (err: any) => sendError(res, 400, "Invalid body: " + JSON.stringify(err));

  const handleAsync = (fn: () => Promise<void>) => fn().catch(err => (console.error(err), sendError(res, 500, "Internal Server Error")));

  // Routes
  if (method === "GET" && segments[0] === "health") return sendJson(res, 200, { ok: true });
  if (segments[0] === "movies") {
    // GET /movies
    if (method === "GET" && segments.length === 1) return handleAsync(async () => sendJson(res, 200, await MovieRepository.findAll()));
    // GET /movies/:id
    if (method === "GET" && hasId && segments.length === 2)
      return handleAsync(async () => {
        const movie = await MovieRepository.findById(movieId!);
        movie ? sendJson(res, 200, movie) : sendError(res, 404, "Movie not found");
      });
    // GET /movies/:id/screenings
    if (method === "GET" && hasId && segments[2] === "screenings")
      return handleAsync(async () => {
        const movie = await MovieRepository.findById(movieId!);
        if (!movie) return sendError(res, 404, "Movie not found");
        const screenings = await ScreeningRepository.findByMovieId(movieId!);
        sendJson(res, 200, screenings);
      });
    // POST /movies
    if (method === "POST" && segments.length === 1)
      return handleAsync(async () => {
        const body = await parseBody(req);
        const parsed = CreateUpdateMovieSchema.safeParse(body);
        if (!parsed.success) return sendBodyError(parsed.error.issues);
        const movie = await MovieRepository.create(parsed.data);
        sendJson(res, 201, movie);
      });
    // PUT /movies/:id
    if (method === "PUT" && hasId && segments.length === 2)
      return handleAsync(async () => {
        const body = await parseBody(req);
        const parsed = CreateUpdateMovieSchema.safeParse(body);
        if (!parsed.success) return sendBodyError(parsed.error.issues);
        const movie = await MovieRepository.update(movieId!, parsed.data);
        movie ? sendJson(res, 200, movie) : sendError(res, 404, "Movie not found");
      });
    // PATCH /movies/:id
    if (method === "PATCH" && hasId && segments.length === 2)
      return handleAsync(async () => {
        const body = await parseBody(req);
        const parsed = PatchMovieSchema.safeParse(body);
        if (!parsed.success) return sendBodyError(parsed.error.issues);

        // Nettoyage partiel : undefined → null pour nullable
        const patchData: Partial<{
          title: string;
          description: string | null;
          durationMinutes: number;
          rating: string | null;
          releaseDate: string | null;
        }> = {};
        if (parsed.data.title !== undefined) patchData.title = parsed.data.title;
        if (parsed.data.description !== undefined) patchData.description = parsed.data.description ?? null;
        if (parsed.data.durationMinutes !== undefined) patchData.durationMinutes = parsed.data.durationMinutes;
        if (parsed.data.rating !== undefined) patchData.rating = parsed.data.rating ?? null;
        if (parsed.data.releaseDate !== undefined) patchData.releaseDate = parsed.data.releaseDate ?? null;

        const movie = await MovieRepository.patch(movieId!, patchData);
        movie ? sendJson(res, 200, movie) : sendError(res, 404, "Movie not found");
      });
    // DELETE /movies/:id
    if (method === "DELETE" && hasId && segments.length === 2)
      return handleAsync(async () => {
        const deleted = await MovieRepository.delete(movieId!);
        deleted ? sendJson(res, 200, { message: "Movie deleted successfully" }) : sendError(res, 404, "Movie not found");
      });
  }

  // 404 fallback
  sendError(res, 404, "Not Found");
}