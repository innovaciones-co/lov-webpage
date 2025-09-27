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
}
