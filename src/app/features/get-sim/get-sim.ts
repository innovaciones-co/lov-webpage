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
      'https://pagos.onepay.la/link/01a0ef44-4202-73fd-9bad-691d7d554cdc',
      '_blank',
    );
  }
}
