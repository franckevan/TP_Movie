import { db } from "./drizzle.js";
import { movies } from "./schema.js";
import { eq } from "drizzle-orm";
import type { Movie } from "../Domain/Movie.js";

function mapRowToMovie(row: any): Movie {
  let releaseDate: string | null = null;
  if (row.release_date instanceof Date && !isNaN(row.release_date.getTime())) {
    releaseDate = row.release_date.toISOString().split("T")[0];
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    durationMinutes: row.duration_minutes,
    rating: row.rating ?? null,
    releaseDate,
  };
}

export class MovieRepository {
  static async findAll(): Promise<Movie[]> {
    const result = await db.select().from(movies).orderBy(movies.id);
    return result.map(mapRowToMovie);
  }

  static async findById(id: number): Promise<Movie | null> {
    const result = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToMovie(result[0]);
  }

  static async create(data: {
    title: string;
    description?: string | null;
    durationMinutes: number;
    rating?: string | null;
    releaseDate?: string | null;
  }): Promise<Movie> {
    const result = await db
      .insert(movies)
      .values({
        title: data.title,
        description: data.description ?? null,
        duration_minutes: data.durationMinutes,
        rating: data.rating ?? null,
        release_date: data.releaseDate ? new Date(data.releaseDate) : null,
      })
      .returning();

    return mapRowToMovie(result[0]);
  }

  static async update(
    id: number,
    data: {
      title: string;
      description?: string | null;
      durationMinutes: number;
      rating?: string | null;
      releaseDate?: string | null;
    }
  ): Promise<Movie | null> {
    const result = await db
      .update(movies)
      .set({
        title: data.title,
        description: data.description ?? null,
        duration_minutes: data.durationMinutes,
        rating: data.rating ?? null,
        release_date: data.releaseDate ? new Date(data.releaseDate) : null,
      })
      .where(eq(movies.id, id))
      .returning();

    if (result.length === 0) return null;
    return mapRowToMovie(result[0]);
  }

  static async patch(
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      durationMinutes: number;
      rating: string | null;
      releaseDate: string | null;
    }>
  ): Promise<Movie | null> {
    const updateData: Partial<{
      title: string;
      description: string | null;
      duration_minutes: number;
      rating: string | null;
      release_date: Date | null;
    }> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
    if (data.rating !== undefined) updateData.rating = data.rating ?? null;
    if (data.releaseDate !== undefined)
      updateData.release_date = data.releaseDate ? new Date(data.releaseDate) : null;

    const result = await db.update(movies).set(updateData).where(eq(movies.id, id)).returning();
    if (result.length === 0) return null;

    return mapRowToMovie(result[0]);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(movies).where(eq(movies.id, id)).returning();
    return result.length > 0;
  }
}