import { Component, computed, input } from '@angular/core';
import { LovHeart } from '../lov-heart/lov-heart';

/**
 * Standard top-of-page header used across the site: brand eyebrow with the logo heart, a big
 * title with an optional word in the brand gradient, the lead text (projected, so it can hold
 * links or bold text) and an optional illustrated icon on the right.
 */
@Component({
  selector: 'app-page-header',
  imports: [LovHeart],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss'
})
export class PageHeader {
  eyebrow = input<string>();
  title = input.required<string>();
  /** Part of the title shown in the brand gradient; must appear verbatim in the title. */
  accent = input<string>();
  /** Material Symbols icon shown as the illustration on the right. */
  icon = input<string>();

  titleParts = computed(() => {
    const title = this.title();
    const accent = this.accent();
    const index = accent ? title.indexOf(accent) : -1;
    if (!accent || index < 0) {
      return { before: title, accent: '', after: '' };
    }
    return { before: title.slice(0, index), accent, after: title.slice(index + accent.length) };
  });
}
