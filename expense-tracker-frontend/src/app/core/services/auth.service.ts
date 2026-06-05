import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { TokenService } from './token.service';

// Central auth service — handles login, register, logout and exposes current user state.
// Components should inject this, not TokenService directly.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  // Writable signal holding the current user. Initialized from localStorage
  // so the user stays logged in after a page refresh.
  private currentUserState = signal<CurrentUser | null>(this.tokenService.getUser());

  // Public read-only signal — components call currentUser() to read, cannot mutate.
  currentUser = this.currentUserState.asReadonly();

  // POST /api/auth/register — creates account, then calls handleAuthSuccess to store token
  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, request)
      .pipe(tap((res) => this.handleAuthSuccess(res.data)));
  }

  // POST /api/auth/login — authenticates user, then calls handleAuthSuccess to store token
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, request)
      .pipe(tap((res) => this.handleAuthSuccess(res.data)));
  }

  // Clears localStorage, resets in-memory user state, and redirects to login page
  logout(): void {
    this.tokenService.clear();
    this.currentUserState.set(null);
    this.router.navigate(['/auth/login']);
  }

  // Used by guards to check if user can access protected routes
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  // Called after both login and register succeed — stores token + user in localStorage
  // and updates the current user signal so all subscribers update immediately
  private handleAuthSuccess(authData: AuthResponse): void {
    this.tokenService.saveToken(authData.token);
    const user: CurrentUser = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
    };
    this.tokenService.saveUser(user);
    this.currentUserState.set(user);
  }
}
