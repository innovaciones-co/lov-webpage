import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessfulPortability } from './successful-portability';

describe('SuccessfulPortability', () => {
  let component: SuccessfulPortability;
  let fixture: ComponentFixture<SuccessfulPortability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessfulPortability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessfulPortability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
