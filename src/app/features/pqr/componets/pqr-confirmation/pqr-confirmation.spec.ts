import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PqrConfirmation } from './pqr-confirmation';

describe('PqrConfirmation', () => {
  let component: PqrConfirmation;
  let fixture: ComponentFixture<PqrConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PqrConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PqrConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
