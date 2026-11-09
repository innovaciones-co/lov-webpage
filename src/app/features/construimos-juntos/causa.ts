import { afterNextRender, Component, inject, signal } from '@angular/core';
import { CjFooter, CjHeader } from './cj-chrome';
import { CjLeadForm } from './cj-lead-form';
import { CjCount, CjReveal } from './cj-motion';
import { CjPage } from './cj-page';

/** Landing 1 of "Construimos juntos": the new temple's cause and the community sign-up. */
@Component({
  selector: 'app-cj-causa',
  imports: [CjHeader, CjFooter, CjLeadForm, CjReveal, CjCount],
  providers: [CjPage],
  templateUrl: './causa.html'
})
export class CjCausa {
  readonly page = inject(CjPage);
  readonly values = ['MADUREZ', 'OBEDIENCIA', 'AMOR', 'SANTIDAD', 'UNIDAD'];
  // Before/after split, in percent.
  readonly compare = signal(50);
  // The congregation video plays behind the hero on large screens only; phones get its still.
  readonly heroVideo = signal(false);

  readonly journey = [
    { title: 'Conoce la causa', text: 'El proyecto del nuevo templo, sus cifras y su propósito.' },
    { title: 'Inscríbete a la comunidad', text: 'Recibe la información del proyecto de primera mano.' },
    { title: 'Conoce la solución', text: 'Cómo tu celular puede aportar a construir el templo.' },
    { title: 'Forma parte activa', text: 'Solicita información para unirte a LOV, sin compromiso.' },
    { title: 'Recibe tu código QR', text: 'Escanéalo y conecta tu línea con propósito.' },
  ];

  constructor() {
    this.page.setup('/construimos-juntos', 'Un nuevo templo para construir juntos | Iglesia Manantial',
      'Manantial presenta el proyecto de su nuevo templo. Conoce la causa e inscríbete en la comunidad que lo hará posible.');
    afterNextRender(() => {
      const wide = matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      this.heroVideo.set(wide && !saveData);
    });
  }

  playMuted(video: HTMLVideoElement): void {
    video.muted = true;
    video.play().catch(() => { /* autoplay blocked: the poster stays */ });
  }
}
