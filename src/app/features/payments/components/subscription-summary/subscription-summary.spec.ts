import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSummary } from './subscription-summary';

describe('SubscriptionSummary', () => {
  let component: SubscriptionSummary;
  let fixture: ComponentFixture<SubscriptionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
