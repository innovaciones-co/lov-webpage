import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessfulActivation } from './successful-activation';

describe('SuccessfulActivation', () => {
  let component: SuccessfulActivation;
  let fixture: ComponentFixture<SuccessfulActivation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessfulActivation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessfulActivation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
