import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '../../../../shared/components/form-fields/input-text/input-text';
import { AuthError } from '../../models/error.models';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, ReactiveFormsModule, InputTextComponent],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private authService = inject(AuthService);

    recoveryForm!: FormGroup;
    error: AuthError | null = null;
    isLoading = false;
    isSubmitted = false;

    ngOnInit() {
        this.initializeForm();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm() {
        this.recoveryForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.recoveryForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.error) {
                    this.error = null;
                    this.cdr.markForCheck();
                }
            });
    }

    onSubmit() {
        if (this.recoveryForm.invalid) {
            this.markFormGroupTouched(this.recoveryForm);
            return;
        }

        this.isLoading = true;
        const email = this.emailControl.value?.toString().trim() ?? '';
        this.authService.requestPasswordReset(email)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isSubmitted = true;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.error = err;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    onBack() {
        this.router.navigate(['/ingreso'], { queryParams: { method: 'email-password' } });
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    // Getters for template
    get emailControl() {
        return this.recoveryForm.get('email') as FormControl;
    }

    get isEmailInvalid() {
        return this.emailControl?.invalid && this.emailControl?.touched;
    }

    getEmailErrorMessage(): string {
        if (!this.emailControl?.errors || !this.emailControl.touched) {
            return '';
        }

        if (this.emailControl.errors['required']) {
            return 'El correo electrónico es requerido';
        }

        if (this.emailControl.errors['email']) {
            return 'Ingresa un correo electrónico válido';
        }

        return 'Error de validación';
    }
}
