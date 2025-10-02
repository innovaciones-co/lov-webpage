import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
})
export class Menu implements OnInit {
  isActive = false;
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  currentRoute = '';

  @ViewChild('navMenu', { static: true }) navMenuRef!: ElementRef<HTMLUListElement>;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.setupHoverEffects();
    this.setupRouteListener();
  }

  private setupHoverEffects() {
    // Only apply hover effects on non-touch devices and in browser
    if (this.isBrowser && window.matchMedia('(pointer: fine)').matches) {
      const navLinks = this.navMenuRef.nativeElement.querySelectorAll<HTMLAnchorElement>('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = link.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          link.style.setProperty('--hover-x', `${x}%`);
        });
        link.addEventListener('mouseleave', () => {
          link.style.removeProperty('--hover-x');
        });
      });
    }
  }

  private setupRouteListener() {
    // Get initial route
    this.currentRoute = this.router.url;

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        // Close mobile menu on route change
        if (this.isActive) {
          this.closeMobileMenu();
        }
      });
  }

  onClick() {
    this.isActive = !this.isActive;
  }

  closeMobileMenu() {
    this.isActive = false;
    this.removeActiveFromDropdowns();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    if (this.isBrowser) {
      this.removeActiveFromDropdowns();
    }
  }

  private removeActiveFromDropdowns(): void {
    const dropdownItems = this.navMenuRef.nativeElement.querySelectorAll('.nav-item.dropdown');
    dropdownItems.forEach(item => {
      item.classList.remove('active');
    });
  }

  isDropdownActive(routes: string[]): boolean {
    if (routes.length === 0 || !this.currentRoute) return false;
    return routes.some(route => {
      // Check for exact route match or if current route starts with the target route
      return this.currentRoute === `/${route}` || this.currentRoute.includes(`/${route}`);
    });
  }

  toggleDropdown(event: Event): void {
    // Only work on small devices (screen width less than 768px) and in browser
    if (!this.isBrowser || window.innerWidth >= 768) {
      return;
    }

    const target = event.target as HTMLElement;
    const dropdownMenu = target.parentElement;

    if (dropdownMenu) {
      // Remove 'active' class from all siblings of the parent element
      const parentOfParent = dropdownMenu.parentElement;
      if (parentOfParent) {
        const siblings = parentOfParent.children;
        Array.from(siblings).forEach(sibling => {
          if (sibling !== dropdownMenu) {
            sibling.classList.remove('active');
          }
        });
      }

      // Toggle 'active' class on current element
      dropdownMenu.classList.toggle('active');
    }
  }
}