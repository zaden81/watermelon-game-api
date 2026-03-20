import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { getEnv } from "../../config/index.js";
import type { JwtPayload } from "./auth.types.js";

export function signAccessToken(payload: JwtPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & JwtPayload;
  return {
    sub: decoded.sub,
    email: decoded.email,
    name: decoded.name,
  };
}
