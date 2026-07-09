import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MsisdnPipe } from '../../../core/pipes/msisdn.pipe';
import {
    AuthResponse,
    AuthState,
    OtpRequest,
    OtpResponse,
    OtpValidation,
    User
} from '../models/auth.models';
import { AuthError } from '../models/error.models';
import { AuthHttpErrorHandler } from './error-handler.service';
import { AuthErrorStateManager } from './error-state.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    private errorHandler = inject(AuthHttpErrorHandler);
    private errorStateManager = inject(AuthErrorStateManager);

    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'user_data';
    private readonly USER_MSISDN = 'user_msisdn';

    private authStateSubject = new BehaviorSubject<AuthState>(AuthState.INITIAL);
    private userSubject = new BehaviorSubject<User | null>(null);
    private otpCountdownSubject = new BehaviorSubject<number>(0);

    private msisdnPipe = new MsisdnPipe();

    // Public observables
    authState$ = this.authStateSubject.asObservable();
    user$ = this.userSubject.asObservable();
    error$ = this.errorStateManager.error$;
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
        this.errorStateManager.clearError();

        const otpRequest: OtpRequest = {
            msisdn: this.msisdnPipe.transform(msisdn)
        };

        return this.http.post<OtpResponse>(`${environment.apiUrl}/authentication/otp/request`, otpRequest)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.authStateSubject.next(AuthState.OTP_SENT);
                        this.startOtpCountdown(60 * 2); // 2 minutes countdown
                    } else {
                        this.handleBusinessError({ message: response.message, code: 'OTP_REQUEST_FAILED' });
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
        this.errorStateManager.clearError();

        const validation: OtpValidation = {
            msisdn: this.msisdnPipe.transform(msisdn),
            otp
        };

        return this.http.post<AuthResponse>(`${environment.apiUrl}/authentication/otp/verify`, validation)
            .pipe(
                tap(response => {
                    // If we reach this point, the HTTP request was successful (status 200-299)
                    this.handleAuthSuccess(response, this.msisdnPipe.transform(msisdn));
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
        this.router.navigate(['/ingreso']);
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
        this.errorStateManager.clearError();
        this.stopOtpCountdown();
        this.currentSessionId = null;
    }

    /**
     * Resend OTP
     */
    resendOtp(msisdn: string): Observable<OtpResponse> {
        return this.requestOtp(msisdn);
    }

    /**
     * Set OTP sent state (used when user already has a code)
     */
    setOtpSentState(): void {
        this.authStateSubject.next(AuthState.OTP_SENT);
        this.errorStateManager.clearError();
    }

    /**
     * Get current error recovery action
     */
    getCurrentErrorRecoveryAction(): string | null {
        return this.errorStateManager.getCurrentErrorRecoveryAction();
    }

    /**
     * Check if current error is retryable
     */
    isCurrentErrorRetryable(): boolean {
        return this.errorStateManager.isCurrentErrorRetryable();
    }

    // Private methods

    private handleAuthSuccess(response: AuthResponse, msisdn: string): void {
        this.storeAuthData(response, msisdn);

        const user: User = {
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
        };

        this.userSubject.next(user);
        this.authStateSubject.next(AuthState.AUTHENTICATED);
        this.stopOtpCountdown();
    }

    private storeAuthData(response: AuthResponse, msisdn?: string): void {
        if (!this.isBrowser) return;

        this.setItem(this.TOKEN_KEY, response.accessToken);

        if (response.refreshToken) {
            this.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }

        this.setItem(this.USER_KEY, JSON.stringify(response.user));
        if (msisdn != undefined) {
            this.setItem(this.USER_MSISDN, msisdn);
        }
    }

    private clearAuthData(): void {
        if (!this.isBrowser) return;

        this.removeItem(this.TOKEN_KEY);
        this.removeItem(this.REFRESH_TOKEN_KEY);
        this.removeItem(this.USER_KEY);
        this.removeItem(this.USER_MSISDN);
    }

    private getStoredToken(): string | null {
        return this.getItem(this.TOKEN_KEY);
    }

    private getStoredUser(): User | null {
        const userData = this.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    getStoredMsisdn(): string | null {
        return this.getItem(this.USER_MSISDN);
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

    /**
     * Handle business logic errors (not HTTP errors)
     */
    private handleBusinessError(error: AuthError): void {
        this.errorStateManager.setError({
            ...error,
            timestamp: new Date(),
            context: 'business'
        });
        this.authStateSubject.next(AuthState.ERROR);
    }

    /**
     * Handle HTTP errors using the dedicated error handler
     */
    private handleHttpError(error: HttpErrorResponse): Observable<never> {
        const processedError = this.errorHandler.handle(error);
        this.errorStateManager.setError(processedError);
        this.authStateSubject.next(AuthState.ERROR_OTP);
        return throwError(() => processedError);
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
