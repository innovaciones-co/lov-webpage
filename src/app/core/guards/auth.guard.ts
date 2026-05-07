import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/authentication/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Store the attempted URL for redirecting after login
    router.navigate(['/ingreso'], { queryParams: { returnUrl: state.url } });
    return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    const returnUrl = route.queryParams['returnUrl'];
    router.navigateByUrl(returnUrl ?? '/dashboard');
    return false;
};
