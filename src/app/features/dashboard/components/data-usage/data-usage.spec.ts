import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUsage } from './data-usage';

describe('DataUsage', () => {
  let component: DataUsage;
  let fixture: ComponentFixture<DataUsage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataUsage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataUsage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
