import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { Login } from './features/authentication/components/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Faq } from './features/faq/components/faq';
import { Home } from './features/home/components/home';
import { Legals } from './features/legals/legals';
import { Payments } from './features/payments/components/payments/payments';
import { Portability } from './features/portability/portability';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'legales',
        component: Legals
    },
    {
        path: 'preguntas-frecuentes',
        component: Faq
    },
    {
        path: 'portabilidad',
        component: Portability
    },
    {
        path: 'ingreso',
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'pagos',
        component: Payments,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
