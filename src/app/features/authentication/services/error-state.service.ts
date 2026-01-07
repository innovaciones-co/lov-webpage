import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthError, DetailedAuthError } from '../models/error.models';

/**
 * Error State Manager following Single Responsibility Principle
 * Manages error state separately from business logic
 */
@Injectable({
    providedIn: 'root'
})
export class AuthErrorStateManager {
    private errorSubject = new BehaviorSubject<AuthError | null>(null);
    private errorHistorySubject = new BehaviorSubject<AuthError[]>([]);

    error$ = this.errorSubject.asObservable();
    errorHistory$ = this.errorHistorySubject.asObservable();

    /**
     * Set current error and add to history
     */
    setError(error: AuthError): void {
        this.errorSubject.next(error);
        this.addToHistory(error);
    }

    /**
     * Clear current error
     */
    clearError(): void {
        this.errorSubject.next(null);
    }

    /**
     * Get current error
     */
    getCurrentError(): AuthError | null {
        return this.errorSubject.value;
    }

    /**
     * Check if current error is retryable
     */
    isCurrentErrorRetryable(): boolean {
        const currentError = this.getCurrentError() as DetailedAuthError;
        return currentError ? currentError.retryable : false;
    }

    /**
     * Get recovery action for current error
     */
    getCurrentErrorRecoveryAction(): string | null {
        const currentError = this.getCurrentError() as DetailedAuthError;
        return currentError ? currentError.recoveryAction || null : null;
    }

    /**
     * Clear error history
     */
    clearHistory(): void {
        this.errorHistorySubject.next([]);
    }

    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity: string): AuthError[] {
        return this.errorHistorySubject.value.filter(
            error => (error as DetailedAuthError).severity === severity
        );
    }

    private addToHistory(error: AuthError): void {
        const currentHistory = this.errorHistorySubject.value;
        const updatedHistory = [error, ...currentHistory].slice(0, 10); // Keep last 10 errors
        this.errorHistorySubject.next(updatedHistory);
    }
}