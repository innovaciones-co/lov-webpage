import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInfo } from './billing-info';

describe('BillingInfo', () => {
  let component: BillingInfo;
  let fixture: ComponentFixture<BillingInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
