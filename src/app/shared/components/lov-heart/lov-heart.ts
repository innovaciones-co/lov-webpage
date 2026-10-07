import { Component, input } from '@angular/core';

let nextId = 0;

/**
 * The heart from the LOV logo: the blue "V" heart, optionally with the logo's red "O" circle
 * overlapping it (navy where they cross). Drawn with the logo's own geometry, so it scales
 * crisply and matches the brand. Size it with CSS (width) on the host.
 */
@Component({
  selector: 'app-lov-heart',
  standalone: true,
  template: `
    @if (withCircle()) {
    <svg viewBox="556 0 1444 792" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath [attr.id]="clipId"><circle cx="957" cy="396" r="396" /></clipPath>
      </defs>
      <circle cx="957" cy="396" r="396" [attr.fill]="red()" />
      <path [attr.d]="heartPath" fill="none" [attr.stroke]="blue()" stroke-width="370"
        stroke-linecap="round" stroke-linejoin="miter" />
      <path [attr.d]="heartPath" fill="none" [attr.stroke]="navy()" stroke-width="370"
        stroke-linecap="round" stroke-linejoin="miter" [attr.clip-path]="'url(#' + clipId + ')'" />
      <circle cx="957" cy="396" r="23" fill="#fff" />
    </svg>
    } @else {
    <svg viewBox="1030 40 975 755" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path [attr.d]="heartPath" fill="none" [attr.stroke]="blue()" stroke-width="370"
        stroke-linecap="round" stroke-linejoin="miter" />
    </svg>
    }
  `,
  styles: [`
    :host { display: inline-block; line-height: 0; }
    svg { width: 100%; height: auto; overflow: visible; }
  `]
})
export class LovHeart {
  withCircle = input(true);
  blue = input('#066EF1');
  red = input('#FF0000');
  navy = input('#052B6C');

  // Two rounded arms meeting in a sharp point: the logo's "V".
  readonly heartPath = 'M1220 230 L1517 527 L1810 230';
  readonly clipId = `lov-heart-clip-${nextId++}`;
}
