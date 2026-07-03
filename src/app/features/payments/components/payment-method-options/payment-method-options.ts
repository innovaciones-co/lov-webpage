import { Component, ChangeDetectionStrategy, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';

@Component({
  selector: 'app-payment-method-options',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './payment-method-options.html',
  styleUrl: './payment-method-options.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodOptions implements AfterViewInit {
  @ViewChild('recurringTemplate') recurringTemplate?: TemplateRef<any>;
  @ViewChild('balanceTemplate') balanceTemplate?: TemplateRef<any>;
  @ViewChild('payuTemplate') payuTemplate?: TemplateRef<any>;

  paymentMethodControl = new FormControl('');

  paymentMethods = signal<any[]>([]);

  ngAfterViewInit() {
    this.paymentMethods.set([
      {
        value: 'recurring',
        template: this.recurringTemplate
      },
      {
        value: 'balance',
        template: this.balanceTemplate
      },
      {
        value: 'payu',
        template: this.payuTemplate
      }
    ]);
  }

  onPaymentMethodChange(method: string): void {
    console.log('Método de pago seleccionado:', method);
  }
}
