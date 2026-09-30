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
			title: 'Términos y Condiciones',
			description: '10/03/2023 Términos y Condiciones Promo_DobleDatos_PlanLOV',
			fileName: 'Promo_DobleDatosV2_PlanLOV.pdf',
			category: 'terms'
		},
		{
			title: 'Oferta comercial',
			description: 'Promociones vigentes hasta el 31 de Diciembre de 2022',
			fileName: 'HISTORICO_DE_PROMOCIONES_12.pdf',
			category: 'promotions'
		},
		{
			title: 'Términos y Condiciones',
			description: '25/11/2022 Términos y Condiciones Promoción 1GB _ Plan LOV Semana',
			fileName: 'Promo_Regalo_1GB_25_30_Nov2022.pdf',
			category: 'terms'
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