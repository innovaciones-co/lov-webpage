import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type PromoDirection = 'left' | 'right';

@Component({
  selector: 'app-promo',
  imports: [NgOptimizedImage, NgClass],
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
}
