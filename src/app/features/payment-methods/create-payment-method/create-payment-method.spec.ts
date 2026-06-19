import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentService } from '../services/payment-service';
import { CreatePaymentMethod } from './create-payment-method';

describe('CreatePaymentMethod', () => {
  let component: CreatePaymentMethod;
  let fixture: ComponentFixture<CreatePaymentMethod>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  beforeEach(async () => {
    paymentServiceSpy = jasmine.createSpyObj<PaymentService>('PaymentService', [
      'createPaymentMethod',
      'getCardType',
      'validateExpiry'
    ]);

    paymentServiceSpy.getCardType.and.returnValue('VISA');
    paymentServiceSpy.validateExpiry.and.returnValue(true);
    paymentServiceSpy.createPaymentMethod.and.returnValue(of({ id: 'pm_test_123' }));

    await TestBed.configureTestingModule({
      imports: [CreatePaymentMethod],
      providers: [{ provide: PaymentService, useValue: paymentServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePaymentMethod);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('customerId', '16112018597');
    fixture.detectChanges();
  });

  it('should create the payment form', () => {
    expect(component).toBeTruthy();
    expect(component.form().contains('cardNumber')).toBeTrue();
    expect(component.form().contains('fullName')).toBeTrue();
    expect(component.form().contains('cvv')).toBeTrue();
  });

  it('should detect the card brand from the form value', () => {
    component.form().controls.cardNumber.setValue('4111111111111111');

    expect(component.brand()).toBe('VISA');
  });

  it('should create a payment method on submit', () => {
    component.form().setValue({
      fullName: 'Juan Perez',
      cardNumber: '4111111111111111',
      expirationMonth: '12',
      expirationYear: '2028',
      cvv: '123',
      payerId: '1234'
    });

    component.onSubmit();

    expect(paymentServiceSpy.createPaymentMethod).toHaveBeenCalledWith(
      jasmine.objectContaining({
        payerId: '16112018597',
        name: 'Juan Perez',
        identificationNumber: '1234',
        creditCardNumber: '4111111111111111',
        creditCardSecurityCode: 123,
        creditCardExpirationMonth: 12,
        creditCardExpirationYear: 2028,
        paymentMethod: 'VISA'
      })
    );
  });
});
