/** Authenticated admin profile returned by the API (never includes password). */
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/** Login form / request payload. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** `data` payload of the login and /me endpoints. */
export interface AuthPayload {
  admin: Admin;
}
