import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansDashboard } from './plans-dashboard';

describe('PlansDashboard', () => {
  let component: PlansDashboard;
  let fixture: ComponentFixture<PlansDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
