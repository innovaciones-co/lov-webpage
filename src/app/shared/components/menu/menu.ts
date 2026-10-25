import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { User } from '../../../features/authentication/models/auth.models';
import { AuthService } from '../../../features/authentication/services/auth.service';

interface MenuLink {
  label: string;
  description: string;
  icon: string;
  route: string;
}

interface MenuSection {
  id: 'tramites' | 'nosotros';
  label: string;
  links: MenuLink[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
})
export class Menu implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private authService = inject(AuthService);

  readonly sections: MenuSection[] = [
    {
      id: 'tramites',
      label: 'Trámites',
      links: [
        { label: 'Portabilidad', description: 'Trae tu número a LOV', icon: 'sync_alt', route: '/portabilidad' },
        { label: 'Activar SIM', description: 'Actívala en segundos', icon: 'sim_card', route: '/activar-sim' },
        { label: 'Bloqueo de equipo', description: 'En caso de pérdida o robo', icon: 'phonelink_lock', route: '/bloqueo-equipo' },
        { label: 'PQR', description: 'Peticiones, quejas y reclamos', icon: 'support_agent', route: '/pqr' },
      ]
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      links: [
        { label: 'Quiénes somos', description: 'El amor nos conecta', icon: 'favorite', route: '/quienes-somos' },
        { label: 'Preguntas frecuentes', description: 'Resuelve tus dudas', icon: 'help', route: '/preguntas-frecuentes' },
        { label: 'Información legal', description: 'Términos y documentos', icon: 'gavel', route: '/legales' },
        { label: 'Histórico de promociones', description: 'Ofertas anteriores', icon: 'local_offer', route: '/historico-promociones' },
      ]
    }
  ];

  user: User | null = null;
  currentRoute = signal('');
  mobileOpen = signal(false);
  // Expanded section in the mobile panel (accordion).
  openSection = signal<MenuSection['id'] | null>(null);
  scrolled = signal(false);

  ngOnInit() {
    this.currentRoute.set(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.closeMobileMenu();
      });

    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 8);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  isSectionActive(section: MenuSection): boolean {
    const path = this.currentRoute().split(/[?#]/)[0];
    return section.links.some(link => path === link.route || path.startsWith(link.route + '/'));
  }

  toggleMobileMenu(): void {
    this.setMobileOpen(!this.mobileOpen());
  }

  closeMobileMenu(): void {
    this.setMobileOpen(false);
    this.openSection.set(null);
  }

  toggleSection(id: MenuSection['id']): void {
    this.openSection.update(current => current === id ? null : id);
  }

  logout() {
    this.authService.logout();
  }

  private setMobileOpen(open: boolean): void {
    this.mobileOpen.set(open);
    // Lock the page behind the full-screen mobile panel.
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = open ? 'hidden' : '';
      this.document.body.classList.toggle('menu-open', open);
    }
  }
}
