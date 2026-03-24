import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-get-sim',
  imports: [],
  templateUrl: './get-sim.html',
  styleUrl: './get-sim.scss'
})
export class GetSim {
  private readonly document = inject(DOCUMENT);

  purchaseSim() {
    this.document.defaultView?.open(
      'https://biz.payulatam.com/L0e6ae15B9B4D27',
      '_blank',
    );
  }
}
