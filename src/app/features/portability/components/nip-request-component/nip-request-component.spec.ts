import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NipRequestComponent } from './nip-request-component';

describe('NipRequestComponent', () => {
  let component: NipRequestComponent;
  let fixture: ComponentFixture<NipRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NipRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NipRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
