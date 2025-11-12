import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, shareReplay, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  isSuccessResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  // Current user as a signal (Angular 18 feature)
  currentUser = signal<User | null>(null);
  
  // Observable for current user
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Cached Observable for user loading - prevents duplicate API calls
  private userLoad$: Observable<User | null> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Start loading user if token exists
    if (this.isAuthenticated()) {
      this.userLoad$ = this.createUserLoadObservable();
      this.userLoad$.subscribe(); // Start the HTTP request
    }
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        if (isSuccessResponse(response) && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   * Single-tenant deployment - automatically uses the single tenant
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (isSuccessResponse(response) && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post(`${this.API_URL}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (isSuccessResponse(response) && response.data) {
          this.setAccessToken(response.data.accessToken);
          this.setRefreshToken(response.data.refreshToken);
        }
      }),
      catchError(error => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile
   */
  private getMe(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Forgot password
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password
   */
  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token
   */
  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Set current user
   */
  private setCurrentUser(user: User): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(data: { user: User; accessToken: string; refreshToken: string }): void {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setCurrentUser(data.user);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.userLoad$ = null;
  }

  /**
   * Create Observable for loading user from token
   * Uses shareReplay to cache and prevent duplicate API calls
   */
  private createUserLoadObservable(): Observable<User | null> {
    return this.getMe().pipe(
      map((response: any) => {
        if (response.status === 'success' && response.data) {
          this.setCurrentUser(response.data);
          return this.currentUser();
        }
        return null;
      }),
      catchError(() => {
        this.clearAuthData();
        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  /**
   * Ensure user is loaded - returns Observable that emits the user or null
   * Used by guards to wait for user authentication
   */
  ensureUserLoaded$(): Observable<User | null> {
    // If user already loaded, return immediately
    if (this.currentUser()) {
      return of(this.currentUser());
    }
    
    // If no token, return null
    if (!this.isAuthenticated()) {
      return of(null);
    }
    
    // Return cached Observable if exists, otherwise create new one
    if (!this.userLoad$) {
      this.userLoad$ = this.createUserLoadObservable();
      this.userLoad$.subscribe(); // Start the HTTP request
    }
    
    return this.userLoad$;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
