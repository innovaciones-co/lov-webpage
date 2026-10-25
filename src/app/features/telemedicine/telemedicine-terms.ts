import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TelemedicineSeo } from './telemedicine-seo';

@Component({
  selector: 'app-telemedicine-terms',
  imports: [RouterLink],
  templateUrl: './telemedicine-terms.html',
  styleUrl: './telemedicine-terms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TelemedicineSeo],
})
export class TelemedicineTerms {
  constructor() {
    inject(TelemedicineSeo).setPage('/telemedicina/terminos-y-condiciones',
      'Términos de telemedicina LOV–AXA | LOV Mobile',
      'Consulta las condiciones, elegibilidad, alcance y exclusiones del Programa de Asistencias LOV–AXA, vigente desde el 24 de septiembre de 2026.');
  }
}
