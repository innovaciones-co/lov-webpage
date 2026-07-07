import { Component, ViewChild, TemplateRef, AfterViewInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';

@Component({
  selector: 'app-payment-method-options',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './payment-method-options.html',
  styleUrl: './payment-method-options.scss'
})
export class PaymentMethodOptions implements AfterViewInit {
  @ViewChild('recurringTemplate') recurringTemplate?: TemplateRef<any>;
  @ViewChild('balanceTemplate') balanceTemplate?: TemplateRef<any>;
  @ViewChild('payuTemplate') payuTemplate?: TemplateRef<any>;

  readonly paymentMethodControl = new FormControl<string | null>(null);

  paymentMethods = signal<any[]>([
    { value: 'recurring', template: this.recurringTemplate },
    { value: 'balance', template: this.balanceTemplate },
    { value: 'payu', template: this.payuTemplate }
  ]);

  ngAfterViewInit(): void {
    this.paymentMethods.set([
      { value: 'recurring', template: this.recurringTemplate },
      { value: 'balance', template: this.balanceTemplate },
      { value: 'payu', template: this.payuTemplate }
    ]);
  }
}
