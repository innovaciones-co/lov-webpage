import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInformationForm } from './customer-information-form';

describe('CustomerInformationForm', () => {
  let component: CustomerInformationForm;
  let fixture: ComponentFixture<CustomerInformationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInformationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInformationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
