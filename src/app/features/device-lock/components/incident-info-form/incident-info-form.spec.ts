import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentInfoForm } from './incident-info-form';

describe('IncidentInfoForm', () => {
  let component: IncidentInfoForm;
  let fixture: ComponentFixture<IncidentInfoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentInfoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentInfoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
