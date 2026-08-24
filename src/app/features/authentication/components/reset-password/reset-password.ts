import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { AuthError } from '../../models/error.models';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, ReactiveFormsModule, InputTextComponent],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPassword implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);
    private authService = inject(AuthService);

    resetForm!: FormGroup;
    error: AuthError | null = null;
    isLoading = false;
    isSubmitted = false;
    token: string | null = null;

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];

        if (!this.token) {
            this.error = {
                message: 'Token inválido o expirado',
                code: 'INVALID_TOKEN',
                timestamp: new Date(),
                context: 'validation'
            };
            this.cdr.markForCheck();
            return;
        }

        this.initializeForm();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm() {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, this.passwordStrengthValidator()]],
            confirmPassword: ['', [Validators.required]]
        });

        // Add validator to confirmPassword that checks password match
        this.confirmPasswordControl.setValidators([
            Validators.required,
            this.passwordMatchValidator()
        ]);
        this.confirmPasswordControl.updateValueAndValidity({ emitEvent: false });

        // Listen to password changes to revalidate confirmPassword
        this.passwordControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.confirmPasswordControl.updateValueAndValidity({ emitEvent: false });
                this.cdr.markForCheck();
            });

        // Listen to confirmPassword changes to validate in real-time
        this.confirmPasswordControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.confirmPasswordControl.markAsTouched();
                this.confirmPasswordControl.updateValueAndValidity({ emitEvent: false });
                this.cdr.markForCheck();
            });

        this.resetForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.error) {
                    this.error = null;
                    this.cdr.markForCheck();
                }
            });
    }

    /**
     * Validator for password strength
     * Minimum 8 characters, at least one number, one lowercase, one uppercase, and one special character
     */
    private passwordStrengthValidator() {
        return (control: FormControl): { [key: string]: boolean } | null => {
            if (!control.value) {
                return null;
            }

            const password = control.value;
            const hasMinLength = password.length >= 8;
            const hasNumber = /\d/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

            const isValid = hasMinLength && hasNumber && hasLowercase && hasUppercase && hasSpecialChar;

            return isValid ? null : { weakPassword: true };
        };
    }

    /**
     * Validator to check if passwords match
     */
    private passwordMatchValidator() {
        return (control: FormControl): { [key: string]: boolean } | null => {
            if (!control.value) {
                return null;
            }

            const password = this.passwordControl?.value;

            if (!password) {
                return null;
            }

            return password === control.value ? null : { passwordMismatch: true };
        };
    }

    onSubmit() {
        if (this.resetForm.invalid) {
            this.markFormGroupTouched(this.resetForm);
            return;
        }

        if (!this.token) {
            this.error = {
                message: 'Token inválido o expirado',
                code: 'INVALID_TOKEN',
                timestamp: new Date(),
                context: 'validation'
            };
            return;
        }

        this.isLoading = true;
        const password = this.passwordControl.value?.toString() ?? '';

    this.authService.resetPasswordConfirm(this.token!, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/ingreso'], { queryParams: { method: 'email-password', reset: 'success' } });
        },
        error: (err) => {
          this.error = err;
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  onCancel() {
    this.error = null;
    this.router.navigate(['/ingreso']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    // Getters for template
    get passwordControl() {
        return this.resetForm.get('password') as FormControl;
    }

    get confirmPasswordControl() {
        return this.resetForm.get('confirmPassword') as FormControl;
    }

    get isPasswordInvalid() {
        return this.passwordControl?.invalid && this.passwordControl?.touched;
    }

    get isConfirmPasswordInvalid() {
        return this.confirmPasswordControl?.invalid && this.confirmPasswordControl?.touched;
    }

    getPasswordErrorMessage(): string {
        if (!this.passwordControl?.errors || !this.passwordControl.touched) {
            return '';
        }

        if (this.passwordControl.errors['required']) {
            return 'La contraseña es requerida';
        }

        if (this.passwordControl.errors['weakPassword']) {
            return 'La contraseña no cumple los requisitos';
        }

        return 'Error de validación';
    }

    getConfirmPasswordErrorMessage(): string {
        if (!this.confirmPasswordControl?.errors) {
            return '';
        }

        if (this.confirmPasswordControl.errors['required']) {
            return 'Confirmar contraseña es requerido';
        }

        if (this.confirmPasswordControl.errors['passwordMismatch']) {
            return 'Las contraseñas no coinciden';
        }

        return 'Error de validación';
    }
}
