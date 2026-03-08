import { z } from "zod";
import type { Screening } from "./Screening.js";

// Schéma Zod pour valider un screening
const RoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
});

const ScreeningSchema = z.object({
  id: z.number(),
  movieId: z.number(),
  screeningDate: z.string(),
  screeningTime: z.string(),
  room: RoomSchema,
});

export class ScreeningService {
  private screenings: Screening[] = [];

  // Ajouter un screening (avec validation Zod)
  add(screeningData: unknown): Screening {
    const screening = ScreeningSchema.parse(screeningData);
    this.screenings.push(screening);
    return screening;
  }

  // Trouver les screenings d’un film
  findByMovieId(movieId: number): Screening[] {
    return this.screenings.filter((s) => s.movieId === movieId);
  }

  // Exemple de logique métier : screenings du futur
  upcomingScreenings(currentDate: string): Screening[] {
    return this.screenings.filter(
      (s) => s.screeningDate >= currentDate
    );
  }
}