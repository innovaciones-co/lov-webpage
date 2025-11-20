import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NipRequestFormComponent } from './nip-request-form.component';

describe('NipRequestFormComponent', () => {
  let component: NipRequestFormComponent;
  let fixture: ComponentFixture<NipRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NipRequestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NipRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
