import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPortabilityComponent } from './new-portability';

describe('NewPortabilityComponent', () => {
  let component: NewPortabilityComponent;
  let fixture: ComponentFixture<NewPortabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPortabilityComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewPortabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
