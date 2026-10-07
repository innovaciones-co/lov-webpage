import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Footer } from "./shared/components/footer/footer";
import { Menu } from './shared/components/menu/menu';
import { WhatsappFab } from "./features/whatsapp-fab/whatsapp-fab";

// Login and the logged-in area keep their original look; every other page gets the refreshed
// public-site styles (see the .public-site block in styles.scss and the form-field components).
const PRIVATE_PATHS = ['/ingreso', '/recuperar-contrase', '/restablecer-contrase', '/dashboard', '/pagos', '/pqr'];

function isPublicPath(url: string): boolean {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  return !PRIVATE_PATHS.some(prefix => path.startsWith(decodeURIComponent(prefix)));
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Footer, WhatsappFab],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('lov-webpage');

  private router = inject(Router);

  protected readonly isPublic = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => isPublicPath(event.urlAfterRedirects))
    ),
    { initialValue: isPublicPath(this.router.url) }
  );
}
