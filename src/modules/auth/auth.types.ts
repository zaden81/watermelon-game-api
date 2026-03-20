export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}
