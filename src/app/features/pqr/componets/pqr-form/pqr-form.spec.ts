import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PqrForm } from './pqr-form';

describe('PqrForm', () => {
  let component: PqrForm;
  let fixture: ComponentFixture<PqrForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PqrForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PqrForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
