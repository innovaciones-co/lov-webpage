import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeScheduler } from './recharge-scheduler';

describe('RechargeScheduler', () => {
  let component: RechargeScheduler;
  let fixture: ComponentFixture<RechargeScheduler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargeScheduler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechargeScheduler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
