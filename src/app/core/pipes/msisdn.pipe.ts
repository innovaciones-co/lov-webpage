import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'msisdn'
})
@Injectable({
    providedIn: 'root'
})
export class MsisdnPipe implements PipeTransform {
    transform(msisdn: string | number): string {
        if (!msisdn) {
            return '';
        }

        // Remove any non-digit characters and ensure proper format
        const cleaned = msisdn.toString().replace(/\D/g, '');

        // Add country code if not present (assuming Colombia +57)
        if (cleaned.length === 10 && !cleaned.startsWith('57')) {
            return `57${cleaned}`;
        }

        return cleaned;
    }


}