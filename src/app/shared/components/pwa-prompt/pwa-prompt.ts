import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

// Chrome/Edge/Samsung's install event; not in TypeScript's DOM types.
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'lov.pwa.installDismissedAt';
// After "Ahora no", don't ask again for two weeks.
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;
// Let the visitor see the page before offering the app.
const SHOW_AFTER_MS = 6000;

/**
 * Offers to install LOV as an app (Android/desktop: the browser's own install dialog; iPhone,
 * which has none: how to add it from Safari's Share menu) and tells installed users when a new
 * version is ready.
 */
@Component({
  selector: 'app-pwa-prompt',
  templateUrl: './pwa-prompt.html',
  styleUrl: './pwa-prompt.scss'
})
export class PwaPrompt {
  /** Only public pages offer the install; the update notice shows everywhere. */
  readonly offerInstall = input(true);

  protected readonly installMode = signal<'native' | 'ios' | null>(null);
  protected readonly updateReady = signal(false);

  private deferredPrompt: InstallPromptEvent | null = null;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.browser) return;
    const destroyRef = inject(DestroyRef);

    const updates = inject(SwUpdate);
    if (updates.isEnabled) {
      updates.versionUpdates.pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(destroyRef)
      ).subscribe(() => this.updateReady.set(true));
      // A broken cached version can't recover by itself: load the current one.
      updates.unrecoverable.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => location.reload());
    }

    if (this.isInstalled() || this.recentlyDismissed()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as InstallPromptEvent;
      setTimeout(() => this.installMode.set('native'), SHOW_AFTER_MS);
    };
    const onInstalled = () => this.installMode.set(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    destroyRef.onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    });

    if (this.isIosSafari()) {
      const timer = setTimeout(() => this.installMode.set('ios'), SHOW_AFTER_MS);
      destroyRef.onDestroy(() => clearTimeout(timer));
    }
  }

  protected async install(): Promise<void> {
    const prompt = this.deferredPrompt;
    if (!prompt) return;
    this.installMode.set(null);
    this.deferredPrompt = null;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'dismissed') this.rememberDismissal();
  }

  protected dismiss(): void {
    this.installMode.set(null);
    this.rememberDismissal();
  }

  protected reload(): void {
    location.reload();
  }

  private isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  // iPhone/iPad in Safari: the only iOS browser that can add a web app to the home screen
  // with its icon and full-screen look. iPadOS reports itself as a Mac with touch.
  private isIosSafari(): boolean {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const otherBrowser = /crios|fxios|edgios|opios|gsa\//i.test(ua);
    return ios && /safari/i.test(ua) && !otherBrowser;
  }

  private recentlyDismissed(): boolean {
    try {
      const at = Number(localStorage.getItem(DISMISSED_KEY));
      return !!at && Date.now() - at < DISMISS_FOR_MS;
    } catch {
      return false;
    }
  }

  private rememberDismissal(): void {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Private mode or blocked storage: it just asks again next visit.
    }
  }
}
