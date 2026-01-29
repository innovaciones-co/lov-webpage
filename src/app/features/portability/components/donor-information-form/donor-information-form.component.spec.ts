import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonorInformationFormComponent } from './donor-information-form.component';

describe('DonorInformationFormComponent', () => {
  let component: DonorInformationFormComponent;
  let fixture: ComponentFixture<DonorInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonorInformationFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DonorInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
