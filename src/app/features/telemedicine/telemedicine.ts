import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TelemedicineSeo } from './telemedicine-seo';
import { LovHeart } from '../../shared/components/lov-heart/lov-heart';

@Component({
  selector: 'app-telemedicine',
  imports: [RouterLink, LovHeart],
  templateUrl: './telemedicine.html',
  styleUrl: './telemedicine.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TelemedicineSeo],
})
export class Telemedicine {
  constructor() {
    inject(TelemedicineSeo).setPage('/telemedicina', 'Salud al alcance de tu mano | Telemedicina LOV',
      'Telemedicina general 24/7 y pediátrica programada para ti y hasta dos familiares elegibles, sin costo adicional con tu plan mensual LOV activo. Llama a AXA.');
  }
  readonly phone = 'tel:+576016462811';
  readonly faqs: { question: string; answer: string; highlight?: string; continuation?: string }[] = [
    { question: '¿Quiénes pueden usar este beneficio?', answer: 'El titular de una línea LOV ', highlight: 'con plan mensual activo', continuation: ' y hasta dos familiares elegibles: cónyuge o compañero permanente, hijos o padres, conforme al condicionado. La atención pediátrica aplica a hijos del titular menores de 15 años.' },
    { question: '¿Tiene algún costo adicional?', answer: 'Las asistencias incluidas no tienen costo adicional. Los servicios externos o adicionales que no estén cubiertos son responsabilidad del usuario.' },
    { question: '¿Puedo solicitar la asistencia desde cualquier ciudad?', answer: 'Sí. El ámbito territorial del programa es Colombia. AXA valida la elegibilidad y coordina la atención de acuerdo con las condiciones del servicio.' },
    { question: '¿Necesito internet para recibir la orientación?', answer: 'La asistencia se coordina por teléfono. Cuando corresponda una videollamada, necesitarás un dispositivo con cámara y conexión a internet. AXA te indicará cómo acceder.' },
    { question: '¿Qué pasa si mi plan mensual está vencido?', answer: 'Debes renovar y mantener activo tu plan mensual LOV para acceder al beneficio. AXA valida la vigencia y las condiciones antes de coordinar la asistencia.' },
    { question: '¿Este servicio atiende urgencias vitales?', answer: 'No. La telemedicina no reemplaza la atención de urgencias ni la atención presencial que requieras. Ante una urgencia vital, acude de inmediato a los servicios de emergencia.' },
  ];
}
