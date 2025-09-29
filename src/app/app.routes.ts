import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Legals } from './features/legals/legals';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'legales',
        component: Legals
    }
];
