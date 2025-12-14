import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSim } from './activate-sim';

describe('ActivateSim', () => {
  let component: ActivateSim;
  let fixture: ComponentFixture<ActivateSim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivateSim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivateSim);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
