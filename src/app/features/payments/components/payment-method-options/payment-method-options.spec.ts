import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodOptions } from './payment-method-options';

describe('PaymentMethodsOptions', () => {
  let component: PaymentMethodOptions;
  let fixture: ComponentFixture<PaymentMethodOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodOptions]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
