import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCardSelector } from './payment-card-selector';

describe('PaymentCardSelector', () => {
  let component: PaymentCardSelector;
  let fixture: ComponentFixture<PaymentCardSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCardSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCardSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
