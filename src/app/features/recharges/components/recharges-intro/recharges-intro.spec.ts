import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargesIntro } from './recharges-intro';

describe('RechargesIntro', () => {
  let component: RechargesIntro;
  let fixture: ComponentFixture<RechargesIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargesIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechargesIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
