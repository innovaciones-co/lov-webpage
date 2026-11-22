import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../features/authentication/services/auth.service';

interface Tab {
  label: string;
  icon: string;
  /** Absent for the tab that opens the "Trámites" sheet instead of navigating. */
  route?: string;
}

interface SheetLink {
  label: string;
  description: string;
  icon: string;
  route: string;
}

const TRAMITES: SheetLink[] = [
  { label: 'Portabilidad', description: 'Trae tu número a LOV', icon: 'sync_alt', route: '/portabilidad' },
  { label: 'Activar SIM', description: 'Actívala en segundos', icon: 'sim_card', route: '/activar-sim' },
  { label: 'Bloqueo de equipo', description: 'Pérdida o robo', icon: 'phonelink_lock', route: '/bloqueo-equipo' },
  { label: 'PQR', description: 'Peticiones y reclamos', icon: 'support_agent', route: '/pqr' },
];

const HELP: SheetLink[] = [
  { label: 'Preguntas frecuentes', description: 'Resuelve tus dudas', icon: 'help', route: '/preguntas-frecuentes' },
  { label: 'Información legal', description: 'Términos y documentos', icon: 'gavel', route: '/legales' },
];

const SHEET_TAB = 3;
const ACCOUNT_PATHS = ['/dashboard', '/ingreso', '/recuperar-contraseña', '/restablecer-contraseña', '/reset-password'];

/** Which tab a page belongs to, or -1 for pages outside the tabs (telemedicina, quiénes somos...). */
function tabFor(url: string): number {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const under = (route: string) => path === route || path.startsWith(route + '/');
  if (path === '/' || path === '') return 0;
  if (under('/planes')) return 1;
  if (under('/recargas') || under('/pagos')) return 2;
  if ([...TRAMITES, ...HELP].some(link => under(link.route))) return SHEET_TAB;
  if (ACCOUNT_PATHS.some(under)) return 4;
  return -1;
}

/**
 * Bottom tab bar of the installed app (PWA) on phones. It's always rendered, so the server and
 * the browser produce the same markup; global styles (styles/_pwa.scss) only show it when <html>
 * has the "is-pwa" class that index.html sets for the installed app.
 */
@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.html',
  imports: [RouterLink],
})
export class TabBar {
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly tramites = TRAMITES;
  readonly help = HELP;
  readonly whatsapp = 'https://wa.me/573330522222';

  private readonly user = toSignal(inject(AuthService).user$, { initialValue: null });
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly sheetOpen = signal(false);

  readonly tabs = computed<Tab[]>(() => [
    { label: 'Inicio', icon: 'home', route: '/' },
    { label: 'Planes', icon: 'smartphone', route: '/planes' },
    { label: 'Recargar', icon: 'bolt', route: '/recargas' },
    { label: 'Trámites', icon: 'apps' },
    this.user()
      ? { label: 'Mi cuenta', icon: 'person', route: '/dashboard' }
      : { label: 'Ingresar', icon: 'login', route: '/ingreso' },
  ]);

  readonly active = computed(() => this.sheetOpen() ? SHEET_TAB : tabFor(this.url()));

  // The bubble stays where it was when the page isn't one of the tabs, so it doesn't jump.
  private lastTab = 0;
  readonly bubbleAt = computed(() => {
    const active = this.active();
    if (active >= 0) this.lastTab = active;
    return this.lastTab;
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.sheetOpen.set(false));

    // Lock the page behind the open sheet.
    effect(() => {
      if (this.isBrowser) this.document.body.classList.toggle('app-sheet-open', this.sheetOpen());
    });
  }

  toggleSheet(): void {
    this.sheetOpen.update(open => !open);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSheet();
  }
}
