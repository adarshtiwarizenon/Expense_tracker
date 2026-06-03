// Payload sent to POST /api/auth/register
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string; // validated on both frontend (form validator) and backend
}

// Payload sent to POST /api/auth/login
export interface LoginRequest {
  email: string;
  password: string;
}

// Shape of the backend response after successful login or register
export interface AuthResponse {
  token: string;     // JWT token — stored in localStorage via TokenService
  type: string;      // always "Bearer"
  userId: number;
  email: string;
  fullName: string;
}

// Minimal user info stored in localStorage after login — used across the app (e.g. navbar display)
export interface CurrentUser {
  id: number;
  email: string;
  fullName: string;
}