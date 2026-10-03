import { Component, computed, input } from '@angular/core';

let nextId = 0;

/**
 * Card network logo (Visa, Mastercard, Amex, Diners) drawn inline, so it needs no image
 * assets. `onDark` renders the white variant used on top of the colored card tiles.
 */
@Component({
  selector: 'app-card-brand-logo',
  template: `
    @switch (brand()) {
      @case ('MASTERCARD') {
        <svg viewBox="0 0 48 30" role="img" aria-label="Mastercard">
          <defs>
            <clipPath [attr.id]="clipId"><circle cx="17" cy="15" r="12" /></clipPath>
          </defs>
          <circle cx="17" cy="15" r="12" fill="#EB001B" />
          <circle cx="31" cy="15" r="12" fill="#F79E1B" />
          <circle cx="31" cy="15" r="12" fill="#FF5F00" [attr.clip-path]="'url(#' + clipId + ')'" />
        </svg>
      }
      @case ('VISA') {
        <svg viewBox="0 0 64 22" role="img" aria-label="Visa">
          <text x="32" y="18" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="20"
            font-weight="900" font-style="italic" letter-spacing="1" [attr.fill]="onDark() ? '#FFFFFF' : '#1A1F71'">VISA</text>
        </svg>
      }
      @case ('AMEX') {
        <svg viewBox="0 0 56 30" role="img" aria-label="American Express">
          <rect x="1" y="1" width="54" height="28" rx="4" [attr.fill]="onDark() ? '#FFFFFF' : '#016FD0'" />
          <text x="28" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="900"
            letter-spacing="0.5" [attr.fill]="onDark() ? '#016FD0' : '#FFFFFF'">AMEX</text>
        </svg>
      }
      @case ('DINERS') {
        <svg viewBox="0 0 48 30" role="img" aria-label="Diners Club">
          <circle cx="24" cy="15" r="13" fill="none" [attr.stroke]="onDark() ? '#FFFFFF' : '#0079BE'" stroke-width="2.5" />
          <path d="M19 7.5a8 8 0 0 0 0 15zM29 7.5a8 8 0 0 1 0 15z" [attr.fill]="onDark() ? '#FFFFFF' : '#0079BE'" />
        </svg>
      }
      @default {
        <span class="material-symbols-outlined generic" aria-label="Tarjeta">credit_card</span>
      }
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; height: var(--brand-logo-height, 24px); }
    svg { height: 100%; width: auto; display: block; }
    .generic { font-size: var(--brand-logo-height, 24px); }
  `]
})
export class CardBrandLogo {
  issuer = input<string | null | undefined>();
  onDark = input(false);

  readonly clipId = `mc-clip-${nextId++}`;

  brand = computed(() => {
    const value = (this.issuer() ?? '').toUpperCase();
    if (value.includes('MASTER')) return 'MASTERCARD';
    if (value.includes('VISA')) return 'VISA';
    if (value.includes('AMEX') || value.includes('AMERICAN')) return 'AMEX';
    if (value.includes('DINERS')) return 'DINERS';
    return 'OTHER';
  });
}
