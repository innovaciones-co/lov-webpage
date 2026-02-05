import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavArrow } from './nav-arrow';

describe('NavArrow', () => {
  let component: NavArrow;
  let fixture: ComponentFixture<NavArrow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavArrow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavArrow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
