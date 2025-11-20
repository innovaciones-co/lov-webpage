import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortinRequestFormComponent } from './portin-request-form.component';

describe('PortinRequestFormComponent', () => {
  let component: PortinRequestFormComponent;
  let fixture: ComponentFixture<PortinRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortinRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortinRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
