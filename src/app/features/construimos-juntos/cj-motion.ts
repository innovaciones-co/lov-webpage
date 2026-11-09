import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/** Adds `is-in` the first time the element scrolls into view (the CSS fades it in). */
@Directive({ selector: '[cjReveal]' })
export class CjReveal {
  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) {
        element.classList.add('is-in');
        return;
      }
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          element.classList.add('is-in');
          observer.disconnect();
        }
      }, { threshold: 0.18 });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

/**
 * Counts up to [cjCount] when it scrolls into view ("3.000", "4.000"). The server renders the
 * final number, so it reads right without JS too.
 */
@Directive({ selector: '[cjCount]' })
export class CjCount {
  readonly cjCount = input.required<number>();

  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    const format = new Intl.NumberFormat('es-CO');
    afterNextRender(() => {
      const target = this.cjCount();
      if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      element.textContent = format.format(0);
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = format.format(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.4 });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
