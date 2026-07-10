import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSummary } from './purchase-summary';

describe('SubscriptionSummary', () => {
  let component: PurchaseSummary;
  let fixture: ComponentFixture<PurchaseSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseSummary]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PurchaseSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
