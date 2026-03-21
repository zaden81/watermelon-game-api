export interface GameSession {
  id: string;
  user_id: string;
  score: number;
  levels_completed: number;
  status: "active" | "completed" | "abandoned";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
