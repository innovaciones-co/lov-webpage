import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

type LeadType = 'COMMUNITY' | 'LOV_INFO';

const CAMPAIGN = 'manantial';

// Shown next to the checkbox and saved with the sign-up, word for word.
const CONSENT: Record<LeadType, string> = {
  COMMUNITY: 'Autorizo a Iglesia Manantial a registrar mis datos para inscribirme en la comunidad de esta causa y enviarme información sobre el proyecto, según su política de tratamiento de datos.',
  LOV_INFO: 'Autorizo a Iglesia Manantial y a LOV Mobile a usar mis datos exclusivamente para atender esta solicitud de información, según la Política de Tratamiento de Datos de LOV.',
};

/** The sign-up form of both landings: join the cause's community, or ask how to join LOV. */
@Component({
  selector: 'cj-lead-form',
  imports: [RouterLink],
  template: `
    @if (state() === 'done') {
    <div class="cj-done" role="status">
      <span class="cj-done__icon"><span class="material-symbols-outlined" aria-hidden="true">check</span></span>
      @if (type() === 'COMMUNITY') {
      <h3>¡Ya eres parte de la comunidad!</h3>
      <p>Gracias, {{ firstName() }}. Manantial te mantendrá al tanto del proyecto del nuevo templo al {{ phoneLabel() }}.</p>
      <a class="cj-btn cj-btn--dark" routerLink="/construimos-juntos/conectividad">
        Conocer cómo se financia <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </a>
      } @else {
      <h3>¡Recibimos tu solicitud!</h3>
      <p>Gracias, {{ firstName() }}. El equipo de LOV te contactará al {{ phoneLabel() }} para explicarte los planes y cómo
        se conectan con la causa. Tú decides después si continúas.</p>
      }
    </div>
    } @else {
    <form class="cj-form" (submit)="submit($event)" novalidate>
      <label class="cj-field">
        <span>Nombre completo</span>
        <input class="cj-input" [class.cj-invalid]="showErrors() && !nameOk()" type="text" autocomplete="name"
          placeholder="Como quieres que te llamemos" maxlength="120" [value]="name()" (input)="name.set($any($event.target).value)">
        @if (showErrors() && !nameOk()) { <small class="cj-error">Escribe tu nombre completo.</small> }
      </label>

      @if (asksEmail()) {
      <label class="cj-field">
        <span>Correo electrónico</span>
        <input class="cj-input" [class.cj-invalid]="showErrors() && !emailOk()" type="email" inputmode="email"
          autocomplete="email" placeholder="tucorreo@ejemplo.com" maxlength="120" [value]="email()"
          (input)="email.set($any($event.target).value)">
        @if (showErrors() && !emailOk()) { <small class="cj-error">Escribe un correo válido, por ejemplo nombre&#64;gmail.com.</small> }
      </label>
      }

      <label class="cj-field">
        <span>{{ type() === 'COMMUNITY' ? 'Celular' : 'Celular de contacto' }}</span>
        <span class="cj-affix" [class.cj-invalid]="showErrors() && !phoneOk()">
          <b>+57</b>
          <input type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="300 000 0000" maxlength="13"
            [value]="phone()" (input)="onPhone($any($event.target))">
        </span>
        @if (showErrors() && !phoneOk()) { <small class="cj-error">Escribe un celular de 10 dígitos que empiece por 3.</small> }
      </label>

      <label class="cj-consent">
        <input type="checkbox" [checked]="consent()" (change)="consent.set($any($event.target).checked)">
        <span>
          {{ consentText() }}
          @if (type() === 'LOV_INFO') {
          <a href="/docs/politicas_de_tratamiento_de_datos_personales_new.pdf" target="_blank" rel="noopener">Ver política</a>
          }
        </span>
      </label>
      @if (showErrors() && !consent()) { <small class="cj-error">Necesitamos tu autorización para registrarte.</small> }

      @if (state() === 'error') { <small class="cj-error" role="alert">{{ error() }}</small> }

      <button class="cj-btn cj-btn--dark" type="submit" [disabled]="state() === 'sending'">
        @if (state() === 'sending') {
        <span class="cj-spinner" aria-hidden="true"></span> Enviando…
        } @else if (type() === 'COMMUNITY') {
        Inscribirme a la comunidad <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
        } @else {
        Quiero conectarme <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        }
      </button>
      <p class="cj-small">
        @if (type() === 'COMMUNITY') {
        Inscribirte expresa tu interés en la causa: no activa ningún servicio ni te compromete a una compra.
        } @else {
        Te contactaremos para explicarte cómo conectarte. Nada se activa sin tu aceptación.
        }
      </p>
    </form>
    }
  `
})
export class CjLeadForm {
  private readonly http = inject(HttpClient);

  readonly type = input.required<LeadType>();
  // The community sign-up asks for the email; joining LOV stays short: name and phone.
  readonly asksEmail = computed(() => this.type() === 'COMMUNITY');

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly consent = signal(false);
  readonly state = signal<'idle' | 'sending' | 'done' | 'error'>('idle');
  readonly error = signal('');
  readonly showErrors = signal(false);

  readonly consentText = computed(() => CONSENT[this.type()]);
  readonly nameOk = computed(() => this.name().trim().length >= 3);
  readonly phoneOk = computed(() => /^3\d{9}$/.test(this.phone()));
  readonly emailOk = computed(() => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email().trim()));
  readonly firstName = computed(() => this.name().trim().split(/\s+/)[0] ?? '');
  readonly phoneLabel = computed(() => {
    const p = this.phone();
    return `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
  });

  // Digits only, 10 at most; a pasted +57 is dropped.
  onPhone(field: HTMLInputElement): void {
    let digits = field.value.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('57')) digits = digits.slice(2);
    digits = digits.slice(0, 10);
    field.value = digits;
    this.phone.set(digits);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.showErrors.set(true);
    const asksEmail = this.asksEmail();
    if (!this.nameOk() || (asksEmail && !this.emailOk()) || !this.phoneOk() || !this.consent()) return;

    this.state.set('sending');
    this.http.post(`${environment.apiUrl}/campaignLeads`, {
      campaign: CAMPAIGN,
      type: this.type(),
      fullName: this.name().trim(),
      email: asksEmail ? this.email().trim().toLowerCase() : null,
      phone: this.phone(),
      consent: true,
      consentText: this.consentText(),
    }).subscribe({
      next: () => this.state.set('done'),
      error: (error) => {
        this.error.set(error?.error?.message || 'No pudimos enviar tus datos. Revisa tu conexión e intenta de nuevo.');
        this.state.set('error');
      }
    });
  }
}
