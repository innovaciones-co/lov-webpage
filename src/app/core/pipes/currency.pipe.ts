import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currency'
})
export class CurrencyPipe implements PipeTransform {
    transform(
        value: number | string | null | undefined,
        decimals: number = 0,
        showSymbol: boolean = true, // true -> "$ 1.234.567", false -> "1.234.567"
        useCode: boolean = false     // true -> "COP 1.234.567", only applies when showSymbol true
    ): string {
        if (value === null || value === undefined || value === '') return '';

        // ensure we have a number
        const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '.'));
        if (Number.isNaN(num)) return String(value);

        // Prefer Intl.NumberFormat when available
        try {
            const nf = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });

            // Intl will typically produce "$ 1.234.567,00" for COP.
            let formatted = nf.format(num);

            // If user wants plain number (no symbol), remove currency symbol that Intl inserted.
            if (!showSymbol) {
                // remove any non-digit, non-separator characters at start (like "$", "COP", spaces, NBSP)
                formatted = formatted.replace(/^[^\d\-\s]+|\s?COP\s?/g, '').trim();
            } else if (useCode) {
                // replace symbol with "COP " (Intl uses "$" for COP). Keep spacing consistent.
                // Remove currency symbol then prefix with 'COP '
                const numericPart = formatted.replace(/^[^\d\-\s]+|\s?COP\s?/g, '').trim();
                formatted = `COP ${numericPart}`;
            } else {
                // ensure common spacing like "$ 1.234.567,00" (Intl sometimes uses NBSP)
                formatted = formatted.replace(/\u00A0/g, ' ');
            }

            return formatted;
        } catch (e) {
            // Fallback formatting (manual) using '.' as thousands separator and ',' as decimal separator
            const sign = num < 0 ? '-' : '';
            const abs = Math.abs(num);
            const rounded = abs.toFixed(decimals); // returns string
            const [intPart, decPart] = rounded.split('.');

            // insert thousands separator (.)
            const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            const numberStr = decimals > 0 ? `${intWithSep},${decPart}` : intWithSep;

            if (!showSymbol) return sign + numberStr;
            if (useCode) return `${sign}COP ${numberStr}`;
            return `${sign}$ ${numberStr}`;
        }
    }
}