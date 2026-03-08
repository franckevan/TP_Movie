import { pool } from "./DB.js";
import type { Screening } from "../Domain/Screening.js";

export class ScreeningRepository {
  static async findByMovieId(movieId: number): Promise<Screening[]> {
    const result = await pool.query<{
      id: number;
      movieId: number;
      screeningDate: string;
      screeningTime: string;
      roomId: number;
      roomName: string;
      roomCapacity: number;
    }>(
      `SELECT 
        s.id,
        s.movie_id AS "movieId",
        DATE(s.start_time) AS "screeningDate",
        TO_CHAR(s.start_time, 'HH24:MI:SS') AS "screeningTime",
        r.id AS "roomId",
        r.name AS "roomName",
        r.capacity AS "roomCapacity"
      FROM screenings s
      JOIN rooms r ON s.room_id = r.id
      WHERE s.movie_id = $1
      ORDER BY s.start_time`,
      [movieId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      screeningDate: row.screeningDate,
      screeningTime: row.screeningTime,
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
      },
    }));
  }
}

