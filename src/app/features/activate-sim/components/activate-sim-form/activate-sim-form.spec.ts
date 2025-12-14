import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSimForm } from './activate-sim-form';

describe('ActivateSimForm', () => {
  let component: ActivateSimForm;
  let fixture: ComponentFixture<ActivateSimForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivateSimForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivateSimForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
