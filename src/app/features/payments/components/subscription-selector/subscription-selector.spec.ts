import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelector } from './subscription-selector';

describe('SubscriptionSelector', () => {
  let component: SubscriptionSelector;
  let fixture: ComponentFixture<SubscriptionSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
