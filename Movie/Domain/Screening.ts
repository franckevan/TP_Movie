// Définir ici le type `Screening` (Domain).
export interface Screening {
  id: number;
  movieId: number;
  screeningDate: string;
  screeningTime: string;
  room: {
    id: number;
    name: string;
    capacity: number;
  };
}
