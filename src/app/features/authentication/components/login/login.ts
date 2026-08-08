import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MsisdnPipe } from "../../../../core/pipes/msisdn.pipe";
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { OtpInputComponent } from "../../../../shared/components/form-fields/otp-input/otp-input";
import { AuthState } from '../../models/auth.models';
import { AuthError } from '../../models/error.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, OtpInputComponent, InputTextComponent, MsisdnPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  msisdnForm!: FormGroup;
  otpForm!: FormGroup;
  credentialsForm!: FormGroup;

  otpFormArray = new FormArray([
    new FormControl('', [Validators.required]),
    new FormControl('', [Validators.required]),
    new FormControl('', [Validators.required]),
    new FormControl('', [Validators.required]),
    new FormControl('', [Validators.required]),
    new FormControl('', [Validators.required])
  ], [this.otpCompleteValidator()]);

  currentState = AuthState.INITIAL;
  loginMethod: 'phone-otp' | 'email-password' = 'phone-otp';
  error: AuthError | null = null;
  countdown = signal<number>(0);
  isLoading = false;
  returnUrl = '/dashboard';
  currentOtpValue = signal<string>('');
  isOtpComplete = signal<boolean>(false);

  // Expose AuthState enum to template
  AuthState = AuthState;

  ngOnInit() {
    this.initializeForms();
    this.setupSubscriptions();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Custom validator to check if OTP is complete
  private otpCompleteValidator() {
    return (control: any) => {
      if (control instanceof FormArray) {
        const otpValue = control.controls
          .map((ctrl: any) => ctrl.value || '')
          .join('');

        if (otpValue.length < 6) {
          return { otpIncomplete: true };
        }
      }
      return null;
    };
  }

  onOtpComplete(otp: string) {
    this.currentOtpValue.set(otp);
    this.isOtpComplete.set(true);
  }

  onOtpChange(otp: string) {
    this.currentOtpValue.set(otp);
    this.isOtpComplete.set(otp.length === 6);
    // Clear any existing errors when user types
    if (this.error) {
      this.error = null;
      this.cdr.markForCheck(); // Trigger change detection
    }
  }

  private initializeForms() {
    this.msisdnForm = this.fb.group({
      msisdn: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: this.otpFormArray
      //otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]
    });

    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Clear errors when MSISDN changes
    this.msisdnForm.get('msisdn')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.error) {
          this.error = null;
          this.cdr.markForCheck();
        }
      });

    this.credentialsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.error) {
          this.error = null;
          this.cdr.markForCheck();
        }
      });
  }

  private setupSubscriptions() {
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentState = state;
        this.isLoading = state === AuthState.REQUESTING_OTP || state === AuthState.VALIDATING_OTP;

        // Navigate after successful authentication
        if (state === AuthState.AUTHENTICATED) {
          this.router.navigateByUrl(this.returnUrl);
        }

        this.cdr.markForCheck(); // Trigger change detection
      });

    // Subscribe to errors
    this.authService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
        this.cdr.markForCheck(); // Trigger change detection
        this.currentOtpValue.set(''); // Clear OTP value on error
        this.isOtpComplete.set(false); // Reset OTP completion state on error
        this.otpFormArray.reset(); // Clear OTP form on error
      });

    // Subscribe to OTP countdown
    this.authService.otpCountdown$
      .pipe(takeUntil(this.destroy$))
      .subscribe(countdown => {
        this.countdown.set(countdown);
      });
  }

  onRequestOtp() {
    if (this.msisdnForm.valid) {
      const msisdn = this.msisdnForm.get('msisdn')?.value;
      this.authService.requestOtp(msisdn).subscribe();
    } else {
      this.markFormGroupTouched(this.msisdnForm);
    }
  }

  onValidateOtp() {
    if (this.otpForm.valid && this.msisdnForm.valid && this.isOtpComplete()) {
      const msisdn = this.msisdnForm.get('msisdn')?.value;
      const otp = this.currentOtpValue();
      this.authService.validateOtp(msisdn, otp).subscribe();
    } else {
      this.markFormGroupTouched(this.otpForm);
      // Mark the FormArray as touched to show validation errors
      this.otpFormArray.markAllAsTouched();
    }
  }

  onHaveCode() {
    if (this.msisdnForm.valid) {
      // Use the service to set state instead of directly setting component state
      // This ensures consistent state management
      this.authService.setOtpSentState();
    } else {
      this.markFormGroupTouched(this.msisdnForm);
    }
  }

  onResendOtp() {
    if (this.msisdnForm.valid) {
      const msisdn = this.msisdnForm.get('msisdn')?.value;
      // Clear OTP values when resending
      this.otpFormArray.reset();
      this.currentOtpValue.set('');
      this.isOtpComplete.set(false);
      this.authService.resendOtp(msisdn).subscribe();
    }
  }

  onBack() {
    this.authService.resetState();
    this.otpForm.reset();
    this.otpFormArray.reset();
    this.currentOtpValue.set('');
    this.isOtpComplete.set(false);
  }

  onSelectLoginMethod(method: 'phone-otp' | 'email-password') {
    if (this.loginMethod === method) {
      return;
    }

    this.loginMethod = method;
    this.error = null;

    if (method === 'phone-otp') {
      this.authService.resetState();
      this.credentialsForm.reset();
    } else {
      this.authService.resetState();
      this.otpForm.reset();
      this.otpFormArray.reset();
      this.currentOtpValue.set('');
      this.isOtpComplete.set(false);
    }
  }

  onLoginWithCredentials() {
    if (this.credentialsForm.invalid) {
      this.markFormGroupTouched(this.credentialsForm);
      return;
    }

    // UI only. Service integration will be added later.
  }

  getCountdownDisplay(): string {
    const minutes = Math.floor(this.countdown() / 60);
    const seconds = this.countdown() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  canResendOtp(): boolean {
    return this.countdown() === 0 && this.currentState === AuthState.OTP_SENT;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for template
  get msisdnControl() {
    return this.msisdnForm.get('msisdn');
  }

  get otpControl() {
    return this.otpForm.get('otp') as FormArray;
  }

  get emailControl() {
    return this.credentialsForm.get('email') as FormControl;
  }

  get passwordControl() {
    return this.credentialsForm.get('password') as FormControl;
  }

  get isMsisdnInvalid() {
    return this.msisdnControl?.invalid && this.msisdnControl?.touched;
  }

  get isOtpInvalid() {
    return this.otpFormArray?.invalid && this.otpFormArray?.touched;
  }

  get isOtpFormValid() {
    return this.isOtpComplete() && this.otpFormArray.valid;
  }

  get isEmailInvalid() {
    return this.emailControl?.invalid && this.emailControl?.touched;
  }

  get isPasswordInvalid() {
    return this.passwordControl?.invalid && this.passwordControl?.touched;
  }

  getOtpErrorMessage(): string {
    if (this.otpFormArray.hasError('otpIncomplete') && this.otpFormArray.touched) {
      return 'Ingresa el código de 6 dígitos completo';
    }
    return 'Código de verificación inválido';
  }

  getCredentialsFieldErrorMessage(field: 'email' | 'password'): string {
    const control = field === 'email' ? this.emailControl : this.passwordControl;

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return field === 'email'
        ? 'El correo electrónico es requerido'
        : 'La contraseña es requerida';
    }

    if (field === 'email' && control.errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }

    if (field === 'password' && control.errors['minlength']) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    return 'Error de validación';
  }

  // Helper methods to determine when to show errors
  shouldShowMsisdnError(): boolean {
    return !!(this.error && (
      this.loginMethod === 'phone-otp' && (
        this.currentState === AuthState.INITIAL ||
        this.currentState === AuthState.REQUESTING_OTP ||
        this.currentState === AuthState.ERROR
      )
    ));
  }

  shouldShowOtpError(): boolean {
    return !!(this.error && (
      this.loginMethod === 'phone-otp' && (
        this.currentState === AuthState.OTP_SENT ||
        this.currentState === AuthState.VALIDATING_OTP ||
        this.currentState === AuthState.ERROR_OTP
      )
    ));
  }

  shouldShowCredentialsError(): boolean {
    return !!(this.error && this.loginMethod === 'email-password');
  }
}

