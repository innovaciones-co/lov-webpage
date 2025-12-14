import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IccidValidationForm } from './iccid-validation-form';

describe('IccidValidationForm', () => {
  let component: IccidValidationForm;
  let fixture: ComponentFixture<IccidValidationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IccidValidationForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IccidValidationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
