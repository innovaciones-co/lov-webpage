import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerInformationFormComponent } from './customer-information-form';


describe('CustomerInformationFormComponent', () => {
  let component: CustomerInformationFormComponent;
  let fixture: ComponentFixture<CustomerInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInformationFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
