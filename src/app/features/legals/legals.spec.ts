import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Legals } from './legals';

describe('Legals', () => {
  let component: Legals;
  let fixture: ComponentFixture<Legals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Legals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Legals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
