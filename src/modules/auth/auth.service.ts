import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "../../shared/index.js";
import { getEnv } from "../../config/index.js";
import { signAccessToken } from "./auth.jwt.js";
import type { User, UserWithPassword, TokenPair, JwtPayload } from "./auth.types.js";
import { ValidationError, UnauthorizedError } from "../../shared/index.js";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseExpiry(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return new Date(Date.now() + value * ms);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<User> {
  const sql = getDb();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const rows = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id, email, name, created_at, updated_at
    `;
    return rows[0] as User;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("unique") &&
      err.message.toLowerCase().includes("email")
    ) {
      throw new ValidationError("Email already registered");
    }
    throw err;
  }
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, password_hash, name, created_at, updated_at
    FROM users WHERE email = ${email}
  `;
  return (rows[0] as UserWithPassword) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, name, created_at, updated_at
    FROM users WHERE id = ${id}
  `;
  return (rows[0] as User) ?? null;
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function generateTokens(user: User): Promise<TokenPair> {
  const env = getEnv();
  const sql = getDb();

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  const accessToken = signAccessToken(payload);

  const rawRefreshToken = randomBytes(40).toString("hex");
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = parseExpiry(env.REFRESH_TOKEN_EXPIRES_IN);

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function refreshAccessToken(
  rawRefreshToken: string,
): Promise<TokenPair> {
  const env = getEnv();
  const sql = getDb();
  const tokenHash = hashToken(rawRefreshToken);

  const rows = await sql`
    SELECT rt.id, rt.user_id, rt.expires_at,
           u.id AS uid, u.email, u.name, u.created_at, u.updated_at
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ${tokenHash}
  `;

  if (rows.length === 0) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const row = rows[0];
  if (new Date(row.expires_at as string) < new Date()) {
    await sql`DELETE FROM refresh_tokens WHERE id = ${row.id}`;
    throw new UnauthorizedError("Refresh token expired");
  }

  // Rotate: delete old, create new
  await sql`DELETE FROM refresh_tokens WHERE id = ${row.id}`;

  const user: User = {
    id: row.uid as string,
    email: row.email as string,
    name: row.name as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  const accessToken = signAccessToken(payload);

  const newRawToken = randomBytes(40).toString("hex");
  const newTokenHash = hashToken(newRawToken);
  const expiresAt = parseExpiry(env.REFRESH_TOKEN_EXPIRES_IN);

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${newTokenHash}, ${expiresAt.toISOString()})
  `;

  return { accessToken, refreshToken: newRawToken };
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const sql = getDb();
  const tokenHash = hashToken(rawRefreshToken);
  await sql`DELETE FROM refresh_tokens WHERE token_hash = ${tokenHash}`;
}
