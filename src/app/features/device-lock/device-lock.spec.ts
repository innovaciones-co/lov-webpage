import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceLock } from './device-lock';

describe('DeviceLock', () => {
  let component: DeviceLock;
  let fixture: ComponentFixture<DeviceLock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceLock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceLock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
