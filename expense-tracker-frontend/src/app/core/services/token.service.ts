import { Injectable } from '@angular/core';
import { CurrentUser } from '../models/auth.model';

// Keys used for localStorage — kept as constants to avoid typos across the app
const TOKEN_KEY = 'finance_token';
const USER_KEY  = 'finance_user';

// Responsible only for reading/writing the JWT and user info in localStorage.
// AuthService uses this — no component should call TokenService directly.
@Injectable({ providedIn: 'root' })
export class TokenService {

  // Saves the raw JWT string received from the backend after login/register
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Returns the JWT string, or null if the user is not logged in
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Saves a minimal user object (id, email, fullName) — avoids re-parsing the JWT every time
  saveUser(user: CurrentUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Returns the stored user object, or null if nothing is saved
  getUser(): CurrentUser | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Simple check: if a token exists in localStorage, we consider the user authenticated
  // Note: does NOT validate token expiry — expired tokens are caught by the backend (401 response)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Called on logout — removes both token and user from localStorage
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}