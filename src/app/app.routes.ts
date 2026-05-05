import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { ActivateSim } from './features/activate-sim/activate-sim';
import { SuccessfulActivation } from './features/activate-sim/components/successful-activation/successful-activation';
import { Login } from './features/authentication/components/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { DeviceLock } from './features/device-lock/device-lock';
import { Faq } from './features/faq/components/faq';
import { Home } from './features/home/components/home';
import { Legals } from './features/legals/legals';
import { PaymentResultComponent } from './features/payments/components/payment-result/payment-result';
import { Payments } from './features/payments/components/payments/payments';
import { Plans } from './features/plans/components/plans/plans';
import { SuccessfulPortability } from './features/portability/components/successful-portability/successful-portability';
import { Portability } from './features/portability/portability';
import { PqrConfirmation } from './features/pqr/componets/pqr-confirmation/pqr-confirmation';
import { Pqr } from './features/pqr/pqr';
import { RechargesIntro } from './features/recharges/components/recharges-intro/recharges-intro';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        canActivate: [guestGuard]
    },
    {
        path: 'activar-sim',
        component: ActivateSim,
        canActivate: [guestGuard]
    },
    {
        path: 'activar-sim/exitoso',
        component: SuccessfulActivation,
        canActivate: [guestGuard]
    },
    {
        path: 'legales',
        component: Legals,
        canActivate: [guestGuard]
    },
    {
        path: 'preguntas-frecuentes',
        component: Faq,
        canActivate: [guestGuard]
    },
    {
        path: 'portabilidad',
        component: Portability,
        canActivate: [guestGuard]
    },
    {
        path: 'portabilidad/exitoso',
        component: SuccessfulPortability,
        canActivate: [guestGuard]
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
        path: 'planes',
        component: Plans,
        canActivate: [guestGuard]
    },
    {
        path: 'recargas',
        component: RechargesIntro,
        canActivate: [guestGuard]
    },
    {
        path: 'pagos',
        component: Payments,
        canActivate: [authGuard]
    },
    {
        path: 'bloqueo-equipo',
        component: DeviceLock,
        canActivate: [guestGuard]
    },
    {
        path: 'pagos/resultado',
        component: PaymentResultComponent,
        canActivate: [guestGuard]
    },
    {
        path: 'pqr',
        component: Pqr,
        canActivate: [authGuard]
    },
    {
        path: 'pqr/confirmacion',
        component: PqrConfirmation,
        canActivate: [guestGuard]
    },
    {
        path: '**',
        redirectTo: '',
        canActivate: [guestGuard]
    }
];
