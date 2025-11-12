import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, shareReplay, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/user.model';
import { IChangePasswordRequest, IRefreshTokenRequest, ILogoutRequest } from '@shared/types/requests';
import { API_ENDPOINTS } from '@shared/types/constants';
import { IApiResponse } from '@shared/types';
import { ILoginResponse, IRegisterResponse, IRefreshTokenResponse, IUserResponse } from '@shared/types/responses';
import { Permission, getRolePermissions } from '@shared/types/permissions';
import { RoleConfig, getRoleConfig } from '@shared/types/role-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API URLs are now constructed using API_ENDPOINTS constants
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  // Current user as a signal (Angular 18 feature)
  currentUser = signal<User | null>(null);
  
  // Observable for current user
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Role configuration cached after login - loaded once per session
  userPermissions = signal<Permission[]>([]);
  roleConfig = signal<RoleConfig | null>(null);
  
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
  register(data: RegisterRequest): Observable<IApiResponse<IRegisterResponse>> {
    return this.http.post<IApiResponse<IRegisterResponse>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`, data).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
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
  login(credentials: LoginRequest): Observable<IApiResponse<ILoginResponse>> {
    return this.http.post<IApiResponse<ILoginResponse>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, credentials).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<IApiResponse<null>> {
    const refreshToken = this.getRefreshToken();
    const body: ILogoutRequest = { refreshToken: refreshToken! };
    
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, body).pipe(
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
  refreshToken(): Observable<IApiResponse<IRefreshTokenResponse>> {
    const refreshToken = this.getRefreshToken();
    const body: IRefreshTokenRequest = { refreshToken: refreshToken! };
    
    return this.http.post<IApiResponse<IRefreshTokenResponse>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, body).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
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
  private getMe(): Observable<IApiResponse<IUserResponse>> {
    return this.http.get<IApiResponse<IUserResponse>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.ME}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(data: IChangePasswordRequest): Observable<IApiResponse<null>> {
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Forgot password
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<IApiResponse<null>> {
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password
   */
  resetPassword(data: ResetPasswordRequest): Observable<IApiResponse<null>> {
    return this.http.post<IApiResponse<null>>(`${environment.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, data).pipe(
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
   * Set current user and load their role configuration
   */
  private setCurrentUser(user: User): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    // Load and cache role configuration for this user
    this.loadRoleConfiguration(user);
  }
  
  /**
   * Load and cache the role configuration for the current user
   * Called once after login/user load for better performance
   */
  private loadRoleConfiguration(user: User): void {
    const role = user.role;
    
    // Get permissions for this role from shared config
    const permissions = getRolePermissions(role);
    this.userPermissions.set(permissions);
    
    // Get role metadata from shared config
    const config = getRoleConfig(role);
    this.roleConfig.set(config);
    
    console.log(`[AuthService] Loaded ${permissions.length} permissions for role: ${role}`);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(data: ILoginResponse | IRegisterResponse): void {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    // Convert IAuthUser to User model
    const user: User = {
      _id: data.user._id,
      tenantId: data.user.tenantId,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: data.user.role,
      employeeId: data.user.employeeId,
      department: data.user.department,
      designation: data.user.designation,
      isActive: data.user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.setCurrentUser(user);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    // Clear cached role configuration
    this.userPermissions.set([]);
    this.roleConfig.set(null);
    this.userLoad$ = null;
  }

  /**
   * Create Observable for loading user from token
   * Uses shareReplay to cache and prevent duplicate API calls
   */
  private createUserLoadObservable(): Observable<User | null> {
    return this.getMe().pipe(
      map((response: IApiResponse<IUserResponse>) => {
        if (response.status === 'success' && response.data) {
          // Convert IUserResponse to User model
          const user: User = {
            _id: response.data._id,
            tenantId: response.data.tenantId,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            role: response.data.role,
            employeeId: response.data.employeeId,
            department: response.data.department,
            designation: response.data.designation,
            phoneNumber: response.data.phoneNumber,
            dateOfJoining: response.data.dateOfJoining,
            employmentType: response.data.employmentType,
            isActive: response.data.isActive,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt
          };
          this.setCurrentUser(user);
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
