import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortabilityInformation } from './portability-information-form.component';

describe('PortabilityInformationFormComponent', () => {
  let component: PortabilityInformation;
  let fixture: ComponentFixture<PortabilityInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortabilityInformation]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PortabilityInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
