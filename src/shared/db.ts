import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getEnv } from "../config/index.js";

let sql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (!sql) {
    const env = getEnv();
    sql = neon(env.DATABASE_URL);
  }
  return sql;
}
