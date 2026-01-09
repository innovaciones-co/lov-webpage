import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { OtpInputComponent } from './otp-input';

describe('OtpInputComponent', () => {
    let fixture: ComponentFixture<OtpInputComponent>;
    let component: OtpInputComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, OtpInputComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OtpInputComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('label', 'Enter OTP Code');
        fixture.componentRef.setInput('control', new FormArray([
            new FormControl(''),
            new FormControl(''),
            new FormControl(''),
            new FormControl(''),
            new FormControl(''),
            new FormControl('')
        ]));
        fixture.detectChanges();
    });

    it('should render label and 6 OTP inputs', () => {
        const label = fixture.nativeElement.querySelector('.otp-label');
        expect(label.textContent).toContain('Enter OTP Code');

        const inputs = fixture.nativeElement.querySelectorAll('.otp-input');
        expect(inputs.length).toBe(6);
    });

    it('should only allow single digit input', () => {
        const input = fixture.nativeElement.querySelector('.otp-input');
        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: '123' },
            writable: false
        });

        component.onInput(event, 0);
        expect(component.control().at(0).value).toBe('3'); // Should only keep the last digit
    });

    it('should filter non-numeric input', () => {
        const input = fixture.nativeElement.querySelector('.otp-input');
        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: 'a1b2c3' },
            writable: false
        });

        component.onInput(event, 0);
        expect(component.control().at(0).value).toBe('3'); // Should only keep the last numeric character
    });

    it('should emit otpComplete when all 6 digits are entered', () => {
        spyOn(component.otpComplete, 'emit');

        // Fill all 6 inputs
        for (let i = 0; i < 6; i++) {
            component.control().at(i).setValue((i + 1).toString());
        }

        // Trigger emitOtpValue by calling onInput
        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: '6' },
            writable: false
        });
        component.onInput(event, 5);

        expect(component.otpComplete.emit).toHaveBeenCalledWith('123456');
    });

    it('should emit otpChange on any input change', () => {
        spyOn(component.otpChange, 'emit');

        const event = new Event('input');
        Object.defineProperty(event, 'target', {
            value: { value: '1' },
            writable: false
        });

        component.onInput(event, 0);
        expect(component.otpChange.emit).toHaveBeenCalledWith('1');
    });

    it('should handle backspace correctly', () => {
        // Set up some values
        component.control().at(0).setValue('1');
        component.control().at(1).setValue('2');

        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        Object.defineProperty(keyEvent, 'target', {
            value: { value: '2' },
            writable: false
        });

        component.onKeyDown(keyEvent, 1);

        expect(component.control().at(1).value).toBe('');
    });

    it('should handle paste correctly', () => {
        const clipboardData = {
            getData: () => '123456'
        };

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: clipboardData as any
        });

        spyOn(pasteEvent, 'preventDefault');

        component.onPaste(pasteEvent);

        expect(pasteEvent.preventDefault).toHaveBeenCalled();
        expect(component.control().at(0).value).toBe('1');
        expect(component.control().at(1).value).toBe('2');
        expect(component.control().at(5).value).toBe('6');
    });

    it('should show error state when form is invalid and touched', () => {
        component.control().setErrors({ required: true });
        component.control().markAsTouched();

        expect(component.hasError()).toBe(true);

        fixture.detectChanges();

        const inputs = fixture.nativeElement.querySelectorAll('.otp-input.invalid');
        expect(inputs.length).toBe(6);
    });
});