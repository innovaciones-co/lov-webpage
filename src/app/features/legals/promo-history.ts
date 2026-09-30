import { Component } from '@angular/core';
import { LegalDocument } from './legals';

@Component({
	selector: 'app-promo-history',
	templateUrl: './promo-history.html',
	styleUrls: ['./legals.scss'],
})
export class PromoHistory {
	legalDocuments: LegalDocument[] = [
		{
			title: 'Oferta comercial',
			description: 'Oferta vigente 2026',
			fileName: 'Oferta Comercial Vigente 2026.pdf',
			category: 'promotions'
		},
		{
			title: 'Oferta comercial',
			description: 'Promociones vigentes hasta el 29 de Febrero de 2024',
			fileName: 'HISTORICO_DE_PROMOCIONES_25.pdf',
			category: 'promotions'
		},
		{
			title: 'Oferta comercial',
			description: 'Promociones vigentes hasta el 30 de Noviembre de 2023',
			fileName: 'HISTORICO_DE_PROMOCIONES_23.pdf',
			category: 'promotions'
		},
		{
			title: 'Oferta comercial',
			description: 'Promociones vigentes hasta el 31 de Diciembre de 2022',
			fileName: 'HISTORICO_DE_PROMOCIONES_12.pdf',
			category: 'promotions'
		},
		{
			title: 'Términos y Condiciones',
			description: '15/06/2022 Términos y Condiciones Promoción 1GB',
			fileName: 'Promo_Regalo_1GB_15_16_junio2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '29/06/2022 Términos y Condiciones Promoción 1GB',
			fileName: 'Promo_Regalo_1GB_29Jun_02Jul_2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '07/07/2022 Términos y Condiciones Promoción 100 min todo destino nacional y 1GB',
			fileName: 'Promo_Regalo_100minTDN_1GB_07Jul_09Jul_2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '14/07/2022 Términos y Condiciones Promoción doble recursos de datos',
			fileName: 'Promo_DobleDatos_Plan_Paquete_5K_14Jul_16Jul_2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '20/07/2022 Términos y Condiciones Promoción mismo plan o paquete LOV',
			fileName: 'Promo_Regalo_20Jul_23Jul_2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '25/11/2022 Términos y Condiciones Promoción 1GB _ Plan LOV Semana',
			fileName: 'Promo_Regalo_1GB_25_30_Nov2022.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '17/02/2023 Términos y Condiciones Promo_DobleDatos_PlanLOV',
			fileName: 'Promo_DobleDatos_PlanLOV.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '10/03/2023 Términos y Condiciones Promo_DobleDatos_PlanLOV',
			fileName: 'Promo_DobleDatosV2_PlanLOV.pdf',
			category: 'terms'
		},
		{
			title: 'Términos y Condiciones',
			description: '27/05/2022 Términos y Condiciones Promoción Clientes Nuevos Finsocial',
			fileName: 'TyC_FINSOCIAL.pdf',
			category: 'promotions-companies'
		},
		{
			title: 'Términos y Condiciones',
			description: '03/06/2022 Términos y Condiciones Oferta Colviseg del Caribe',
			fileName: 'TERMINOS_Y_ CONDICIONES_OFERTA_COLVISEG_DEL_CARIBE.pdf',
			category: 'promotions-companies'
		},
		{
			title: 'Términos y Condiciones',
			description: '26/11/2022 Términos y Condiciones Promoción Navidad Grupo PREVISALUD',
			fileName: 'TyC_PROMOCION_NAVIDAD_PREVISALUD.pdf',
			category: 'promotions-companies'
		}
	];
	getDocumentsByCategory(category: string): LegalDocument[] {
		return this.legalDocuments.filter(doc => doc.category === category);
	}

	downloadDocument(fileName: string): void {
		const link = document.createElement('a');
		link.href = `/docs/history/${fileName}`;
		link.download = fileName;
		link.target = '_blank';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}