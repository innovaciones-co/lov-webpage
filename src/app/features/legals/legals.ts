import { Component } from '@angular/core';

interface LegalDocument {
  title: string;
  description: string;
  fileName: string;
  category: 'terms' | 'privacy' | 'regulatory' | 'user-info';
}

@Component({
  selector: 'app-legals',
  imports: [],
  templateUrl: './legals.html',
  styleUrl: './legals.scss'
})
export class Legals {
  legalDocuments: LegalDocument[] = [
    {
      title: 'Términos y Condiciones',
      description: 'Condiciones del servicio prepago LOV',
      fileName: 'condiciones_servicio_prepago_lov.pdf',
      category: 'terms'
    },
    {
      title: 'Política de Privacidad',
      description: 'Políticas de tratamiento de datos personales',
      fileName: 'politicas_de_tratamiento_de_datos_personales_new.pdf',
      category: 'privacy'
    },
    {
      title: 'Habeas Data',
      description: 'Información sobre protección de datos personales',
      fileName: 'habeas_data.pdf',
      category: 'privacy'
    },
    {
      title: 'Medios de Atención al Usuario',
      description: 'Canales disponibles para atención al cliente',
      fileName: 'medios_de_atencion_al_usuario_new.pdf',
      category: 'user-info'
    },
    {
      title: 'Autoridades de Vigilancia y Control',
      description: 'Información sobre entidades reguladoras',
      fileName: 'autoridades_vigilancia_y_control.pdf',
      category: 'regulatory'
    },
    {
      title: 'Información Regulatoria',
      description: 'Información regulatoria de interés para el usuario',
      fileName: 'informacion_regulatoria_de_interes_para_el_usuario_new.pdf',
      category: 'regulatory'
    },
    {
      title: 'Internet Sano',
      description: 'Políticas para un uso responsable de internet',
      fileName: 'internet_sano.pdf',
      category: 'regulatory'
    },
    {
      title: 'Seguridad en la Red',
      description: 'Medidas de seguridad y protección en línea',
      fileName: 'seguridad_en_la_red.pdf',
      category: 'regulatory'
    },
    {
      title: 'Usos Prohibidos',
      description: 'Actividades no permitidas en nuestros servicios',
      fileName: 'usos_prohibidos.pdf',
      category: 'terms'
    },
    {
      title: 'Tiempos de Entrega SIM',
      description: 'Información sobre tiempos de entrega de tarjetas SIM',
      fileName: 'tiempos_de_entrega_sim_lov.pdf',
      category: 'user-info'
    },
    {
      title: 'Indicativos de Marcación LDI',
      description: 'Códigos para llamadas de larga distancia internacional',
      fileName: 'indicativos_marcacion_ldi.pdf',
      category: 'user-info'
    },
    {
      title: 'Contra Material de Contenido de Abuso',
      description: 'Políticas contra contenido inapropiado',
      fileName: 'contra_material_de_contenido_de_abuso.pdf',
      category: 'regulatory'
    }
  ];

  getDocumentsByCategory(category: string): LegalDocument[] {
    return this.legalDocuments.filter(doc => doc.category === category);
  }

  downloadDocument(fileName: string): void {
    const link = document.createElement('a');
    link.href = `/docs/${fileName}`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
