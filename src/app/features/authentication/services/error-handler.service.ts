import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    AuthError,
    AuthErrorCode,
    DetailedAuthError,
    ErrorSeverity,
    IErrorMapper,
    IHttpErrorHandler
} from '../models/error.models';

/**
 * HTTP Error Mapper implementing Single Responsibility Principle
 */
@Injectable({
    providedIn: 'root'
})
export class HttpErrorMapper implements IErrorMapper {

    private readonly errorMappings = new Map<number, () => AuthError>([
        [0, () => this.createNetworkError()],
        [400, () => this.createBadRequestError()],
        [401, () => this.createUnauthorizedError()],
        [404, () => this.createNotFoundError()],
        [500, () => this.createServerError()],
    ]);

    mapError(status: number, error: any): AuthError {
        const mapper = this.errorMappings.get(status);

        if (mapper) {
            return this.enhanceError(mapper(), status, error);
        }

        return this.createGenericError(status, error);
    }

    private createNetworkError(): AuthError {
        return {
            message: 'No se pudo conectar al servidor. Por favor verifica tu conexión a internet.',
            code: AuthErrorCode.NETWORK_ERROR,
            timestamp: new Date(),
            context: 'network'
        };
    }

    private createBadRequestError(): AuthError {
        return {
            message: 'Solicitud inválida.',
            code: AuthErrorCode.BAD_REQUEST,
            timestamp: new Date(),
            context: 'validation'
        };
    }

    private createUnauthorizedError(): AuthError {
        return {
            message: 'No autorizado. Por favor verifica tus credenciales.',
            code: AuthErrorCode.UNAUTHORIZED,
            timestamp: new Date(),
            context: 'authorization'
        };
    }

    private createNotFoundError(): AuthError {
        return {
            message: 'Recurso no encontrado.',
            code: AuthErrorCode.NOT_FOUND,
            timestamp: new Date(),
            context: 'resource'
        };
    }

    private createServerError(): AuthError {
        return {
            message: 'Error interno del servidor. Por favor intenta nuevamente más tarde.',
            code: AuthErrorCode.SERVER_ERROR,
            timestamp: new Date(),
            context: 'server'
        };
    }

    private createGenericError(status: number, error: any): AuthError {
        return {
            message: error?.error?.message || 'Ha ocurrido un error. Por favor intenta nuevamente.',
            code: error?.error?.code || AuthErrorCode.HTTP_ERROR,
            statusCode: status,
            originalError: error,
            timestamp: new Date(),
            context: 'unknown'
        };
    }

    private enhanceError(baseError: AuthError, status: number, originalError: any): AuthError {
        return {
            ...baseError,
            statusCode: status,
            originalError,
            message: this.getSpecificMessage(status, originalError) || baseError.message
        };
    }

    private getSpecificMessage(status: number, error: any): string | null {
        // Handle specific server messages
        if (status === 400 && error.error?.code === 'VALIDATION_FAILED') {
            return 'El código OTP es inválido. Por favor intenta nuevamente.';
        }

        if (status === 401 && error.error?.message === 'Invalid OTP code') {
            return 'El código OTP es inválido. Por favor intenta nuevamente.';
        }

        return error.error?.message || null;
    }
}

/**
 * Enhanced HTTP Error Handler implementing Single Responsibility Principle
 */
@Injectable({
    providedIn: 'root'
})
export class AuthHttpErrorHandler implements IHttpErrorHandler {

    constructor(private errorMapper: HttpErrorMapper) { }

    handle(error: HttpErrorResponse): AuthError {
        console.error('HTTP Error occurred:', {
            status: error.status,
            message: error.message,
            error: error.error
        });

        const mappedError = this.errorMapper.mapError(error.status, error);
        return this.enrichError(mappedError);
    }

    private enrichError(error: AuthError): DetailedAuthError {
        return {
            ...error,
            severity: this.determineSeverity(error),
            recoveryAction: this.getRecoveryAction(error),
            retryable: this.isRetryable(error)
        };
    }

    private determineSeverity(error: AuthError): ErrorSeverity {
        switch (error.code) {
            case AuthErrorCode.NETWORK_ERROR:
            case AuthErrorCode.SERVER_ERROR:
                return ErrorSeverity.HIGH;
            case AuthErrorCode.INVALID_OTP:
            case AuthErrorCode.VALIDATION_FAILED:
                return ErrorSeverity.MEDIUM;
            case AuthErrorCode.UNAUTHORIZED:
                return ErrorSeverity.HIGH;
            default:
                return ErrorSeverity.LOW;
        }
    }

    private getRecoveryAction(error: AuthError): string {
        switch (error.code) {
            case AuthErrorCode.NETWORK_ERROR:
                return 'Verificar conexión a internet y reintentar';
            case AuthErrorCode.INVALID_OTP:
                return 'Verificar el código e intentar nuevamente';
            case AuthErrorCode.SERVER_ERROR:
                return 'Esperar unos minutos y reintentar';
            case AuthErrorCode.UNAUTHORIZED:
                return 'Verificar credenciales e iniciar sesión nuevamente';
            default:
                return 'Reintentar la operación';
        }
    }

    private isRetryable(error: AuthError): boolean {
        const nonRetryableCodes = [
            AuthErrorCode.INVALID_OTP,
            AuthErrorCode.UNAUTHORIZED,
            AuthErrorCode.VALIDATION_FAILED
        ];

        return !nonRetryableCodes.includes(error.code as AuthErrorCode);
    }
}