import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  // Initialized from localStorage so user stays logged in after refresh.
  private currentUserState = signal<CurrentUser | null>(this.tokenService.getUser());
  currentUser = this.currentUserState.asReadonly();

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, request)
      .pipe(tap((res) => this.handleAuthSuccess(res.data)));
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, request)
      .pipe(tap((res) => this.handleAuthSuccess(res.data)));
  }

  logout(): void {
    this.tokenService.clear();
    this.currentUserState.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

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
