import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CjFooter, CjHeader } from './cj-chrome';
import { CjLeadForm } from './cj-lead-form';
import { CjCount, CjReveal } from './cj-motion';
import { CjPage } from './cj-page';

/** Landing 2 of "Construimos juntos": how LOV's service would fund the temple, and the LOV sign-up. */
@Component({
  selector: 'app-cj-conectividad',
  imports: [RouterLink, CjHeader, CjFooter, CjLeadForm, CjReveal, CjCount],
  providers: [CjPage],
  templateUrl: './conectividad.html'
})
export class CjConectividad {
  readonly page = inject(CjPage);

  // Monthly plans from the campaign presentation.
  readonly plans = [
    { gb: '15', unit: 'GB', price: '$24.900' },
    { gb: '30', unit: 'GB', price: '$29.900' },
    { gb: '50', unit: 'GB', price: '$39.900', star: true },
    { gb: 'Ilimitado', unit: '', price: '$55.000' },
  ];

  readonly how = [
    { title: 'La comunidad conoce' },
    { title: 'Cada persona decide' },
    { title: 'El aporte se reporta' },
  ];

  readonly journey = [
    { title: 'Solicitas información', text: 'Nos cuentas si te interesa una línea nueva, traer tu número o una asesoría.' },
    { title: 'LOV te explica la oferta', text: 'Precio, vigencia, cobertura, requisitos y soporte, con todo claro.' },
    { title: 'Decides si continúas', text: 'Solo con tu aceptación empieza la afiliación o la portabilidad.' },
    { title: 'Recibes tu código QR', text: 'Lo escaneas y tu línea queda conectada con propósito.' },
  ];

  constructor() {
    this.page.setup('/construimos-juntos/conectividad', 'Conectividad con propósito | LOV × Iglesia Manantial',
      'Tu celular de todos los días puede ayudar a construir el nuevo templo de Manantial. Conoce el modelo y solicita información para unirte a LOV.');
  }
}
