import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MsisdnPipe } from '../../../core/pipes/msisdn.pipe';
import {
    AuthError,
    AuthResponse,
    AuthState,
    OtpRequest,
    OtpResponse,
    OtpValidation,
    User
} from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'user_data';

    private authStateSubject = new BehaviorSubject<AuthState>(AuthState.INITIAL);
    private userSubject = new BehaviorSubject<User | null>(null);
    private errorSubject = new BehaviorSubject<AuthError | null>(null);
    private otpCountdownSubject = new BehaviorSubject<number>(0);

    private msisdnPipe = new MsisdnPipe();

    // Public observables
    authState$ = this.authStateSubject.asObservable();
    user$ = this.userSubject.asObservable();
    error$ = this.errorSubject.asObservable();
    otpCountdown$ = this.otpCountdownSubject.asObservable();

    private currentSessionId: string | null = null;
    private countdownTimer: any;

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    constructor() {
        this.initializeAuth();


    }

    private initializeAuth(): void {
        const token = this.getStoredToken();
        const userData = this.getStoredUser();

        if (token && userData) {
            this.userSubject.next(userData);
            this.authStateSubject.next(AuthState.AUTHENTICATED);
        }
    }

    /**
     * Request OTP for the given MSISDN
     */
    requestOtp(msisdn: string): Observable<OtpResponse> {
        this.authStateSubject.next(AuthState.REQUESTING_OTP);
        this.clearError();

        const otpRequest: OtpRequest = {
            msisdn: this.msisdnPipe.transform(msisdn)
        };

        return this.http.post<OtpResponse>(`${environment.apiUrl}/authentication/otp/request`, otpRequest)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.authStateSubject.next(AuthState.OTP_SENT);
                        this.startOtpCountdown(300); // 5 minutes countdown
                    } else {
                        this.handleError({ message: response.message, code: 'OTP_REQUEST_FAILED' });
                    }
                }),
                catchError(this.handleHttpError.bind(this))
            );
    }

    /**
     * Validate OTP and authenticate user
     */
    validateOtp(msisdn: string, otp: string): Observable<AuthResponse> {
        this.authStateSubject.next(AuthState.VALIDATING_OTP);
        this.clearError();

        const validation: OtpValidation = {
            msisdn: this.msisdnPipe.transform(msisdn),
            otp
        };

        return this.http.post<AuthResponse>(`${environment.apiUrl}/authentication/otp/verify`, validation)
            .pipe(
                tap(response => {
                    // If we reach this point, the HTTP request was successful (status 200-299)
                    this.handleAuthSuccess(response);
                }),
                catchError(this.handleHttpError.bind(this))
            );
    }

    /**
     * Logout user
     */
    logout(): void {
        this.clearAuthData();
        this.authStateSubject.next(AuthState.INITIAL);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.authStateSubject.value === AuthState.AUTHENTICATED && !!this.getStoredToken();
    }

    /**
     * Get current authentication token
     */
    getToken(): string | null {
        return this.getStoredToken();
    }

    /**
     * Refresh authentication token
     */
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getItem(this.REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<AuthResponse>(`${environment.apiUrl}/authentication/refresh?refreshToken=${refreshToken}`, null)
            .pipe(
                tap(response => {
                    // If we reach this point, the HTTP request was successful (status 200-299)
                    this.storeAuthData(response);
                }),
                catchError(error => {
                    this.logout();
                    return throwError(() => error);
                })
            );
    }

    /**
     * Reset authentication state
     */
    resetState(): void {
        this.authStateSubject.next(AuthState.INITIAL);
        this.clearError();
        this.stopOtpCountdown();
        this.currentSessionId = null;
    }

    /**
     * Resend OTP
     */
    resendOtp(msisdn: string): Observable<OtpResponse> {
        return this.requestOtp(msisdn);
    }

    // Private methods

    private handleAuthSuccess(response: AuthResponse): void {
        this.storeAuthData(response);

        const user: User = {
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
        };

        this.userSubject.next(user);
        this.authStateSubject.next(AuthState.AUTHENTICATED);
        this.stopOtpCountdown();

        // Navigate to dashboard or intended route
        this.router.navigate(['/dashboard']);
    }

    private storeAuthData(response: AuthResponse): void {
        if (!this.isBrowser) return;

        this.setItem(this.TOKEN_KEY, response.accessToken);

        if (response.refreshToken) {
            this.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }

        this.setItem(this.USER_KEY, JSON.stringify(response.user));
    }

    private clearAuthData(): void {
        if (!this.isBrowser) return;

        this.removeItem(this.TOKEN_KEY);
        this.removeItem(this.REFRESH_TOKEN_KEY);
        this.removeItem(this.USER_KEY);
    }

    private getStoredToken(): string | null {
        return this.getItem(this.TOKEN_KEY);
    }

    private getStoredUser(): User | null {
        const userData = this.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }



    private startOtpCountdown(seconds: number): void {
        this.stopOtpCountdown();
        this.otpCountdownSubject.next(seconds);

        this.countdownTimer = timer(0, 1000).subscribe(elapsed => {
            const remaining = seconds - elapsed;

            if (remaining <= 0) {
                this.stopOtpCountdown();
                return;
            }

            this.otpCountdownSubject.next(remaining);
        });
    }

    private stopOtpCountdown(): void {
        if (this.countdownTimer) {
            this.countdownTimer.unsubscribe();
            this.countdownTimer = null;
        }
        this.otpCountdownSubject.next(0);
    }

    private handleError(error: AuthError): void {
        this.errorSubject.next(error);
        this.authStateSubject.next(AuthState.ERROR);
    }

    private clearError(): void {
        this.errorSubject.next(null);
    }

    private handleHttpError(error: HttpErrorResponse): Observable<never> {
        let authError: AuthError;

        if (error.error && error.error.message) {
            authError = {
                message: error.error.message,
                code: error.error.code || 'HTTP_ERROR'
            };
        } else {
            authError = {
                message: 'Ha ocurrido un error. Por favor intenta nuevamente.',
                code: 'NETWORK_ERROR'
            };
        }

        this.handleError(authError);
        return throwError(() => authError);
    }

    // Safe localStorage wrapper methods
    private setItem(key: string, value: string): void {
        if (this.isBrowser) {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        }
    }

    private getItem(key: string): string | null {
        if (this.isBrowser) {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.warn('Failed to read from localStorage:', error);
                return null;
            }
        }
        return null;
    }

    private removeItem(key: string): void {
        if (this.isBrowser) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
        }
    }
}
