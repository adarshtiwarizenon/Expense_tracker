import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  // BehaviorSubject holds the current user in memory.
  // Initialized from localStorage so the user stays logged in after a page refresh.
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.tokenService.getUser());

  // Public read-only observable — components (e.g. navbar) subscribe to this to react when the user logs in/out
  currentUser$ = this.currentUserSubject.asObservable();

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
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Used by guards to check if user can access protected routes
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  // Called after both login and register succeed — stores token + user in localStorage
  // and pushes the new user into the BehaviorSubject so all subscribers update immediately
  private handleAuthSuccess(authData: AuthResponse): void {
    this.tokenService.saveToken(authData.token);
    const user: CurrentUser = {
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
    };
    this.tokenService.saveUser(user);
    this.currentUserSubject.next(user);
  }
}
