import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentPlan } from './current-plan';
import { DashboardService } from '../services/dashboard.service';
import { PaymentService } from '../../payments/services/payment.service';
import { ProductFactoryService } from '../../payments/services/product-factory.service';

describe('CurrentPlan', () => {
  let component: CurrentPlan;
  let fixture: ComponentFixture<CurrentPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentPlan],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getCurrentPlan: jasmine.createSpy(),
            deactivateCurrentPlan: jasmine.createSpy()
          }
        },
        { provide: PaymentService, useValue: { selectProduct: jasmine.createSpy() } },
        { provide: ProductFactoryService, useValue: { createPlanProduct: jasmine.createSpy() } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
