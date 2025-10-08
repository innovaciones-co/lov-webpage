import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Legals } from './features/legals/legals';
import { Portability } from './features/portability/portability';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'legales',
    component: Legals,
  },
  {
    path: 'portabilidad',
    component: Portability,
  },
];
