import { Component } from '@angular/core';
import { DeviceDetectionService } from '../../../../core/services/device-detection.service';
import { PaymentService } from '../../services/payment.service';
import { BillingInfoComponent } from "../billing-info/billing-info";
import { Summary } from "../summary/summary";

@Component({
  selector: 'app-payments',
  imports: [Summary, BillingInfoComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments {
  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private paymentService: PaymentService
  ) { }

  isMobile(): boolean {
    return this.deviceDetectionService?.isMobile() ?? false;
  }

  canContinue() {
    return this.paymentService.canCheckout();
  }

  onContinue() {
    const success = this.paymentService.submitBillingInfo();
    if (success) {
      console.log('Billing info submitted successfully, proceeding to next step');
      // Here you can add logic to navigate to the next step or handle the successful submission
    } else {
      console.log('Billing info validation failed, please check the form');
    }
  }
}
