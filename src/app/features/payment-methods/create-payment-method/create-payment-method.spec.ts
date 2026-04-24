import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentTokenService } from '../services/pay-uservice';
import { CreatePaymentMethod } from './create-payment-method';

describe('CreatePaymentMethod', () => {
  let component: CreatePaymentMethod;
  let fixture: ComponentFixture<CreatePaymentMethod>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentTokenService>;

  beforeEach(async () => {
    paymentServiceSpy = jasmine.createSpyObj<PaymentTokenService>('PaymentTokenService', [
      'createToken',
      'getCardType',
      'validateExpiry'
    ]);

    paymentServiceSpy.getCardType.and.returnValue('VISA');
    paymentServiceSpy.validateExpiry.and.returnValue(true);
    paymentServiceSpy.createToken.and.returnValue(of({ id: 'tok_test_123' }));

    await TestBed.configureTestingModule({
      imports: [CreatePaymentMethod],
      providers: [{ provide: PaymentTokenService, useValue: paymentServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePaymentMethod);
    component = fixture.componentInstance;
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

  it('should store the generated token after submit', () => {
    component.form().setValue({
      fullName: 'Juan Perez',
      cardNumber: '4111111111111111',
      expirationMonth: '12',
      expirationYear: '2028',
      cvv: '123',
      payerId: '1'
    });

    component.onSubmit();

    expect(paymentServiceSpy.createToken).toHaveBeenCalledWith(
      jasmine.objectContaining({
        number: '4111111111111111',
        cvv: '123'
      })
    );
    expect(component.generatedToken()).toBe('tok_test_123');
  });
});
