import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePickerComponent } from './date-picker';

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<DatePickerComponent>;
  let component: DatePickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DatePickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    (component.label as any).value = 'Birthdate';
    (component.control as any).value = new FormControl('');
    fixture.detectChanges();
  });

  it('should render label and date input', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Birthdate');
    const input = fixture.nativeElement.querySelector('input[type="date"]');
    expect(input).toBeTruthy();
  });

  it('should emit valueChange on blur if valid', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.control().setValue('2025-10-01');
    component.control().markAsTouched();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]');
    input.dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalledWith('2025-10-01');
  });
});
