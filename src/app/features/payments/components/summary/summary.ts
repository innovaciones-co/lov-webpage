import { Component } from '@angular/core';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.scss'
})
export class Summary {
  constructor(private paymentService: PaymentService) { }

  continue() {
    console.log('Continue button clicked', this.paymentService.canCheckout());
    return this.paymentService.canCheckout();
  }
}
