import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../app.routes';
import { AuthService } from '../../services/auth.service';
import { ResetPassword } from './reset-password';

@Component({ template: '' })
class ResetDestination {}

describe('Password reset links', () => {
  it('preserves the token when redirecting the old email path', async () => {
    const legacyRoute = routes.find(route => route.path === 'reset-password')!;
    TestBed.configureTestingModule({ providers: [provideRouter([
      legacyRoute,
      { path: 'restablecer-contraseña', component: ResetDestination }
    ])] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/reset-password?token=test-token', ResetDestination);
    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.queryParams['token']).toBe('test-token');
    expect(url.root.children['primary'].segments[0].path).toBe('restablecer-contraseña');
  });

  it('initializes the form and shows an error when the token is missing', () => {
    TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: AuthService, useValue: {} }]
    });
    const fixture = TestBed.createComponent(ResetPassword);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.resetForm).toBeDefined();
    expect(fixture.componentInstance.error?.code).toBe('INVALID_TOKEN');
  });
});
