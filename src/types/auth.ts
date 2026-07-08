// ── Auth / User Types ──────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginResponse {
  accessToken?: string;
  user: AuthUser;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
}
