import { Component, HostListener, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CjPage } from './cj-page';

/** The campaign's own header: Manantial's logo and the two pages; solid once you scroll. */
@Component({
  selector: 'cj-header',
  imports: [RouterLink],
  template: `
    <header class="cj-header" [class.cj-header--solid]="solid()">
      <div class="cj-wrap cj-header__row">
        <a class="cj-header__logo" routerLink="/construimos-juntos" aria-label="Construimos juntos · Iglesia Manantial">
          <img src="/construimos-juntos/manantial-logo-blanco.png" alt="Iglesia Manantial" width="144" height="48">
        </a>
        <nav class="cj-nav" aria-label="Páginas de la causa">
          <a routerLink="/construimos-juntos" [class.is-active]="active() === 'causa'">La causa</a>
          <a routerLink="/construimos-juntos/conectividad" [class.is-active]="active() === 'conectividad'">Conectividad con propósito</a>
        </nav>
        <a class="cj-btn cj-btn--gold" [href]="'#' + ctaTarget()" (click)="page.scrollTo(ctaTarget(), $event)">{{ ctaLabel() }}</a>
      </div>
    </header>
  `
})
export class CjHeader {
  readonly page = inject(CjPage);
  readonly active = input.required<'causa' | 'conectividad'>();
  readonly ctaLabel = input('Inscribirme');
  readonly ctaTarget = input('registro');
  readonly solid = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.solid.set(window.scrollY > 40);
  }
}

@Component({
  selector: 'cj-footer',
  imports: [RouterLink],
  template: `
    <footer class="cj-footer">
      <div class="cj-wrap">
        <div class="cj-footer__top">
          <div class="cj-footer__brand">
            <img src="/construimos-juntos/manantial-logo-blanco.png" alt="Iglesia Manantial" width="138" height="46">
            <span class="cj-footer__script">Construimos juntos</span>
          </div>
        </div>
        <div class="cj-footer__bottom">
          <span>Una causa de Iglesia Manantial · Proyecto nuevo templo. Cifras de referencia sujetas a confirmación.</span>
          <span>
            <a routerLink="/construimos-juntos">La causa</a> ·
            <a routerLink="/construimos-juntos/conectividad">Conectividad con propósito</a>
          </span>
        </div>
      </div>
    </footer>
  `
})
export class CjFooter {}
