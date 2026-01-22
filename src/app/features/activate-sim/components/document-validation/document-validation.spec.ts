import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentValidation } from './document-validation';

describe('DocumentValidation', () => {
  let component: DocumentValidation;
  let fixture: ComponentFixture<DocumentValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
