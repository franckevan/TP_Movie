
import { pgTable, serial, text, integer, timestamp, numeric } from "drizzle-orm/pg-core";

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration_minutes: integer("duration_minutes").notNull(),
  rating: text("rating"),
  release_date: timestamp("release_date"),
});