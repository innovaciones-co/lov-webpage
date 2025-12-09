import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthError, AuthState } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  msisdnForm!: FormGroup;
  otpForm!: FormGroup;

  currentState = AuthState.INITIAL;
  error: AuthError | null = null;
  countdown = 0;
  isLoading = false;
  returnUrl = '/';

  // Expose AuthState enum to template
  AuthState = AuthState;

  ngOnInit() {
    this.initializeForms();
    this.setupSubscriptions();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    this.msisdnForm = this.fb.group({
      msisdn: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]
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
          this.router.navigate([this.returnUrl]);
        }
      });

    // Subscribe to errors
    this.authService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });

    // Subscribe to OTP countdown
    this.authService.otpCountdown$
      .pipe(takeUntil(this.destroy$))
      .subscribe(countdown => {
        this.countdown = countdown;
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
    if (this.otpForm.valid && this.msisdnForm.valid) {
      const msisdn = this.msisdnForm.get('msisdn')?.value;
      const otp = this.otpForm.get('otp')?.value;
      this.authService.validateOtp(msisdn, otp).subscribe();
    } else {
      this.markFormGroupTouched(this.otpForm);
    }
  }

  onResendOtp() {
    if (this.msisdnForm.valid) {
      const msisdn = this.msisdnForm.get('msisdn')?.value;
      this.authService.resendOtp(msisdn).subscribe();
    }
  }

  onBack() {
    this.authService.resetState();
    this.otpForm.reset();
  }

  getCountdownDisplay(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  canResendOtp(): boolean {
    return this.countdown === 0 && this.currentState === AuthState.OTP_SENT;
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
    return this.otpForm.get('otp');
  }

  get isMsisdnInvalid() {
    return this.msisdnControl?.invalid && this.msisdnControl?.touched;
  }

  get isOtpInvalid() {
    return this.otpControl?.invalid && this.otpControl?.touched;
  }
}

