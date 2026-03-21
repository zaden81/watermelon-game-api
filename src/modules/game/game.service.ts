import { getDb } from "../../shared/index.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../shared/index.js";
import type { GameSession } from "./game.types.js";

export async function createSession(userId: string): Promise<GameSession> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO game_sessions (user_id)
    VALUES (${userId})
    RETURNING id, user_id, score, levels_completed, status, completed_at, created_at, updated_at
  `;
  return rows[0] as GameSession;
}

export async function updateScore(
  sessionId: string,
  userId: string,
  score: number,
  levelsCompleted?: number,
): Promise<GameSession> {
  const sql = getDb();

  // Fetch session first
  const existing = await sql`
    SELECT id, user_id, status FROM game_sessions WHERE id = ${sessionId}
  `;
  if (existing.length === 0) {
    throw new NotFoundError("Game session not found");
  }
  if (existing[0].user_id !== userId) {
    throw new ForbiddenError("You do not own this game session");
  }
  if (existing[0].status !== "active") {
    throw new ValidationError("Game session is not active");
  }

  const rows =
    levelsCompleted !== undefined
      ? await sql`
          UPDATE game_sessions
          SET score = ${score}, levels_completed = ${levelsCompleted}, updated_at = NOW()
          WHERE id = ${sessionId}
          RETURNING id, user_id, score, levels_completed, status, completed_at, created_at, updated_at
        `
      : await sql`
          UPDATE game_sessions
          SET score = ${score}, updated_at = NOW()
          WHERE id = ${sessionId}
          RETURNING id, user_id, score, levels_completed, status, completed_at, created_at, updated_at
        `;

  return rows[0] as GameSession;
}

export async function completeSession(
  sessionId: string,
  userId: string,
): Promise<GameSession> {
  const sql = getDb();

  // Fetch session first
  const existing = await sql`
    SELECT id, user_id, status FROM game_sessions WHERE id = ${sessionId}
  `;
  if (existing.length === 0) {
    throw new NotFoundError("Game session not found");
  }
  if (existing[0].user_id !== userId) {
    throw new ForbiddenError("You do not own this game session");
  }
  if (existing[0].status !== "active") {
    throw new ValidationError("Game session is not active");
  }

  const rows = await sql`
    UPDATE game_sessions
    SET status = 'completed', completed_at = NOW(), updated_at = NOW()
    WHERE id = ${sessionId}
    RETURNING id, user_id, score, levels_completed, status, completed_at, created_at, updated_at
  `;

  return rows[0] as GameSession;
}

export async function getUserSessions(
  userId: string,
): Promise<GameSession[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, user_id, score, levels_completed, status, completed_at, created_at, updated_at
    FROM game_sessions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 20
  `;
  return rows as GameSession[];
}
