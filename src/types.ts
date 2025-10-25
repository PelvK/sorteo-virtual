export interface Team {
  id: string;
  name: string;
  ballCage: number;
}

export interface Zone {
  id: string;
  name: string;
  teams: (string | null)[];
}

export interface DrawConfig {
  numZones: number;
  ballCages: Team[][];
  drawOrder: string[];
  category?: number;
  drawMode?: 'manual' | 'random';
}

export interface CategoryConfig {
  year: number;
  numZones: number;
  ballCageTeams: number[];
}
