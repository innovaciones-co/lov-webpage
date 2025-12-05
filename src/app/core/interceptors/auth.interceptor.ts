import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/authentication/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip auth header for auth-related requests
    const isAuthRequest = req.url.includes('/api/authentication/');

    if (isAuthRequest) {
        return next(req);
    }

    // Add auth token to requests
    const token = authService.getToken();

    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // Handle 401 Unauthorized errors
                if (error.status === 401) {
                    // Try to refresh token
                    return authService.refreshToken().pipe(
                        switchMap(() => {
                            // Retry the original request with new token
                            const newToken = authService.getToken();
                            const retryReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${newToken}`
                                }
                            });
                            return next(retryReq);
                        }),
                        catchError(() => {
                            // Refresh failed, logout user
                            authService.logout();
                            return throwError(() => error);
                        })
                    );
                }

                return throwError(() => error);
            })
        );
    }

    return next(req);
};
