import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Portability } from './portability';

describe('Portability', () => {
  let component: Portability;
  let fixture: ComponentFixture<Portability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Portability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
