import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from './input-text';

describe('InputTextComponent', () => {
  let fixture: ComponentFixture<InputTextComponent>;
  let component: InputTextComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [InputTextComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('control', new FormControl(''));
    fixture.detectChanges();
  });

  it('should render label and input', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Name');
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should emit valueChange on blur if valid', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.control().setValue('test');
    component.control().markAsTouched();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalledWith('test');
  });
});
