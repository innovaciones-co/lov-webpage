import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LovHeart } from '../lov-heart/lov-heart';

export type PromoDirection = 'left' | 'right';

export interface PromoHighlight {
  /** Material Symbols icon name. */
  icon: string;
  text: string;
}

@Component({
  selector: 'app-promo',
  imports: [NgOptimizedImage, NgClass, RouterLink, LovHeart],
  templateUrl: './promo.html',
  styleUrl: './promo.scss',
  host: {
    '[class.reverse]': 'direction() === "right"'
  }
})
export class Promo {
  title = input.required<string>();
  description = input.required<string>();
  image = input.required<string>();
  logo = input<string>();
  direction = input<PromoDirection>('left');
  imageFit = input<'cover' | 'contain'>('cover');
  mobileAspectRatio = input<string>();
  objectPosition = input<string>('center');
  /** When set (e.g. "1232 / 864"), the whole section height adapts to the image's own ratio at every breakpoint so the image never gets cropped. */
  fullImage = input<string>();

  /** Small label above the title (e.g. "Propósito LOV"). */
  eyebrow = input<string>();
  /** Part of the title shown in the brand gradient; must appear verbatim in the title. */
  titleAccent = input<string>();
  /** Short benefits shown as icon rows under the description. */
  highlights = input<PromoHighlight[]>([]);
  ctaText = input<string>();
  ctaLink = input<string>();

  titleParts = computed(() => {
    const title = this.title();
    const accent = this.titleAccent();
    const index = accent ? title.indexOf(accent) : -1;
    if (!accent || index < 0) {
      return { before: title, accent: '', after: '' };
    }
    return {
      before: title.slice(0, index),
      accent,
      after: title.slice(index + accent.length)
    };
  });
}
