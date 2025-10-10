import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortabilityStatusComponent } from './portability-status';

describe('PortabilityStatusComponent', () => {
  let component: PortabilityStatusComponent;
  let fixture: ComponentFixture<PortabilityStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortabilityStatusComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PortabilityStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
