import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { SelectComponent } from './select';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;
  let component: SelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    // Use direct assignment for signals
    (component.label as any).value = 'Country';
    (component.options as any).value = [
      { label: 'Colombia', value: 'co' },
      { label: 'Peru', value: 'pe' },
    ];
    (component.control as any).value = new FormControl('co');
    fixture.detectChanges();
  });

  it('should render label and select', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Country');
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('should emit valueChange on blur if valid', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.control().setValue('co');
    component.control().markAsTouched();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    select.dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalledWith('co');
  });
});
