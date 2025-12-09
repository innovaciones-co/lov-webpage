import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingInfoComponent } from './billing-info';


describe('BillingInfo', () => {
  let component: BillingInfoComponent;
  let fixture: ComponentFixture<BillingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BillingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
