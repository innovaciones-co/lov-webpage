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

  // Mobile market, as La República published it (CRC data, Q3 2026): lines, yearly change %, share %.
  readonly market = [
    { name: 'Claro', lines: '43.170.071', growth: 4.7, share: 45.652 },
    { name: 'Movistar', lines: '23.110.886', growth: 10.1, share: 24.44 },
    { name: 'Tigo', lines: '17.095.689', growth: 1.5, share: 18.078 },
    { name: 'WOM', lines: '5.143.366', growth: -30.7, share: 5.439 },
    { name: 'Virgin Mobile', lines: '3.336.359', growth: 4.1, share: 3.528 },
    { name: 'Éxito', lines: '2.259.613', growth: -1.3, share: 2.39 },
    { name: 'LOV', lines: '196.060', growth: 149.8, share: 0.207, lov: true },
  ];
  private readonly maxGrowth = Math.max(...this.market.map(row => row.growth));
  private readonly number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

  format(value: number): string {
    return this.number.format(value);
  }

  // Bar length for the yearly change, against the fastest growing; drops get none.
  growthWidth(growth: number): number {
    return growth > 0 ? Math.max(2, (growth / this.maxGrowth) * 100) : 0;
  }

  constructor() {
    this.page.setup('/construimos-juntos/conectividad', 'Conectividad con propósito | LOV × Iglesia Manantial',
      'Tu celular de todos los días puede ayudar a construir el nuevo templo de Manantial. Conoce el modelo y solicita información para unirte a LOV.');
  }
}
