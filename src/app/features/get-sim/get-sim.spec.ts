import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetSim } from './get-sim';

describe('GetSim', () => {
  let component: GetSim;
  let fixture: ComponentFixture<GetSim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetSim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetSim);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
