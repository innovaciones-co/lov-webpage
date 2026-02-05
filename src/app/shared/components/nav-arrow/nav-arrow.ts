import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav-arrow',
  imports: [],
  templateUrl: './nav-arrow.html',
  styleUrl: './nav-arrow.scss',
  host: {
    class: 'app-nav-arrow'
  }
})
export class NavArrow {
  direction = input.required<'next' | 'back'>();
  onClick = output<void>();
}
