/**
 * Error handling interfaces and types following SOLID principles
 */

import { HttpErrorResponse } from "@angular/common/http";

/**
 * Base interface for all error handlers (Interface Segregation Principle)
 */
export interface IErrorHandler<T = any> {
    handle(error: T): AuthError;
}

/**
 * HTTP Error Handler interface
 */
export interface IHttpErrorHandler extends IErrorHandler<HttpErrorResponse> { }

/**
 * Error mapping interface for extensibility (Open/Closed Principle)
 */
export interface IErrorMapper {
    mapError(status: number, error: any): AuthError;
}

/**
 * Enhanced AuthError with more context
 */
export interface AuthError {
    message: string;
    code: string;
    statusCode?: number;
    originalError?: any;
    timestamp?: Date;
    context?: string;
}

/**
 * Error codes enum for better type safety
 */
export enum AuthErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_OTP = 'INVALID_OTP',
    UNAUTHORIZED = 'UNAUTHORIZED',
    BAD_REQUEST = 'BAD_REQUEST',
    NOT_FOUND = 'NOT_FOUND',
    SERVER_ERROR = 'SERVER_ERROR',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    OTP_REQUEST_FAILED = 'OTP_REQUEST_FAILED',
    HTTP_ERROR = 'HTTP_ERROR'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Enhanced error with severity and recovery suggestions
 */
export interface DetailedAuthError extends AuthError {
    severity: ErrorSeverity;
    recoveryAction?: string;
    retryable: boolean;
}