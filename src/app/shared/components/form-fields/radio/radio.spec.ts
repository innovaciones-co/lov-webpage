import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RadioComponent } from '../radio';

describe('RadioComponent', () => {
  let fixture: ComponentFixture<RadioComponent>;
  let component: RadioComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RadioComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    (component.label as any).value = 'Gender';
    (component.options as any).value = [
      { label: 'Male', value: 'm' },
      { label: 'Female', value: 'f' },
    ];
    (component.control as any).value = new FormControl('m');
    fixture.detectChanges();
  });

  it('should render legend and radio options', () => {
    const legend = fixture.nativeElement.querySelector('legend');
    expect(legend.textContent).toContain('Gender');
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
  });

  it('should emit valueChange on blur if valid', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.control().setValue('m');
    component.control().markAsTouched();
    fixture.detectChanges();
    const radio = fixture.nativeElement.querySelector('input[type="radio"]');
    radio.dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalledWith('m');
  });
});
