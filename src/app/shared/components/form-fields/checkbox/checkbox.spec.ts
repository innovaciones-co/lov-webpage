import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox';

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxComponent>;
  let component: CheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CheckboxComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    (component.label as any).value = 'Accept terms';
    (component.control as any).value = new FormControl(false);
    fixture.detectChanges();
  });

  it('should render label and checkbox', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Accept terms');
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('should emit valueChange on blur if valid', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.control().setValue(true);
    component.control().markAsTouched();
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalledWith(true);
  });
});
