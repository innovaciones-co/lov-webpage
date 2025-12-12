import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberComponent } from './input-number';

describe('InputNumberComponent', () => {
    let fixture: ComponentFixture<InputNumberComponent>;
    let component: InputNumberComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, InputNumberComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InputNumberComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('label', 'Amount');
        fixture.componentRef.setInput('control', new FormControl(''));
        fixture.detectChanges();
    });

    it('should render label and number input', () => {
        const label = fixture.nativeElement.querySelector('label');
        expect(label.textContent).toContain('Amount');
        const input = fixture.nativeElement.querySelector('input[type="number"]');
        expect(input).toBeTruthy();
    });

    it('should emit valueChange on blur if valid', () => {
        const spy = jasmine.createSpy('valueChange');
        component.valueChange.subscribe(spy);
        component.control().setValue('100');
        component.onBlur();
        expect(spy).toHaveBeenCalledWith(100);
    });

    it('should filter non-numeric input', () => {
        const input = fixture.nativeElement.querySelector('input');
        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: 'abc123def' },
            enumerable: true
        });

        component.onInput(event);
        expect(component.control().value).toBe('123');
    });

    it('should handle decimal points correctly', () => {
        const input = fixture.nativeElement.querySelector('input');
        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: '12.34.56' },
            enumerable: true
        });

        component.onInput(event);
        expect(component.control().value).toBe('12.3456');
    });
});