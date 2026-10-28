import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'reset-password',
    renderMode: RenderMode.Client
  },
  {
    path: 'restablecer-contraseña',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'pagos/resultado',
    renderMode: RenderMode.Client
  }
];
