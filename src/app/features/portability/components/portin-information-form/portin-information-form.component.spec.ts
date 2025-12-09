import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortinInformationFormComponent } from './portin-information-form.component';

describe('PortinInformationFormComponent', () => {
  let component: PortinInformationFormComponent;
  let fixture: ComponentFixture<PortinInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortinInformationFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PortinInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
