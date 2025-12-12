import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansIntro } from './plans-intro';

describe('PlansIntro', () => {
  let component: PlansIntro;
  let fixture: ComponentFixture<PlansIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
