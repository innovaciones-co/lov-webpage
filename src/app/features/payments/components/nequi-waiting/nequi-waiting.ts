import { isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, PLATFORM_ID, signal } from '@angular/core';

// Nequi keeps a push payment request alive this long (its certification guide).
const REQUEST_LIFE_MS = 45 * 60 * 1000;

/**
 * Waiting screen while the customer approves a Nequi push payment in their app, in Nequi's
 * brand (logotype, Uva/Orquídea/Guanábana colors, per its brand manual).
 */
@Component({
  selector: 'app-nequi-waiting',
  templateUrl: './nequi-waiting.html',
  styleUrl: './nequi-waiting.scss'
})
export class NequiWaiting {
  amount = input<number>(0);
  phone = input<string | null>(null);
  createdAt = input<string | null>(null);

  private readonly now = signal(Date.now());

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  readonly amountText = computed(() => '$' + Math.round(this.amount()).toLocaleString('es-CO'));

  // Only the last digits, as the app shows it: *** *** 5107.
  readonly maskedPhone = computed(() => {
    const digits = (this.phone() ?? '').replace(/[^0-9]/g, '');
    return digits.length >= 4 ? `*** *** ${digits.slice(-4)}` : null;
  });

  private readonly remainingMs = computed(() => {
    const created = this.createdAt() ? Date.parse(this.createdAt()!) : NaN;
    return Number.isNaN(created) ? null : Math.max(0, created + REQUEST_LIFE_MS - this.now());
  });

  readonly remainingText = computed(() => {
    const ms = this.remainingMs();
    if (ms === null) return null;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly expired = computed(() => this.remainingMs() === 0);
}
