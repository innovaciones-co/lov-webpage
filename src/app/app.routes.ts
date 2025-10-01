import { Routes } from '@angular/router';
import { Faq } from './features/faq/faq';
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
    },
    {
        path: 'preguntas-frecuentes',
        component: Faq
    }
];
