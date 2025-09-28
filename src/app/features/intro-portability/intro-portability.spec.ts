import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroPortability } from './intro-portability';

describe('IntroPortability', () => {
  let component: IntroPortability;
  let fixture: ComponentFixture<IntroPortability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroPortability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroPortability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
