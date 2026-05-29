import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.tokenService.getUser());
  currentUser$ = this.currentUserSubject.asObservable();

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
    this.currentUserSubject.next(null);
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
    this.currentUserSubject.next(user);
  }
}
