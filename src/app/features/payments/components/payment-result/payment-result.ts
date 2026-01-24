import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseStatus } from '../../models/payment-response.model';
import { PaymentResponseService } from '../../services/payment-response.service';
import { PurchaseStatusComponent } from '../purchase-status/purchase-status';

@Component({
    selector: 'app-payment-result',
    imports: [PurchaseStatusComponent],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentResultComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private paymentResponseService = inject(PaymentResponseService);

    purchaseStatus = signal<PurchaseStatus | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.processPaymentResponse();
    }

    private processPaymentResponse(): void {
        try {
            // Obtener todos los parámetros de la query string
            const queryParams = this.route.snapshot.queryParams;

            // Convertir a URLSearchParams para usar el servicio
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== null && queryParams[key] !== undefined) {
                    urlParams.append(key, queryParams[key]);
                }
            });

            const payuResponse = this.paymentResponseService.parseUrlParams(urlParams);
            const purchaseStatus = this.paymentResponseService.convertTosPurchaseStatus(payuResponse);

            this.purchaseStatus.set(purchaseStatus);
            this.error.set(null);
        } catch (error) {
            console.error('Error procesando respuesta de pago:', error);
            this.error.set('Error procesando la respuesta del pago. Por favor contacta soporte.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onGoToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    onDownloadReceipt(transactionId: string): void {
        // TODO: Implementar descarga de comprobante
        console.log('Descargar comprobante para transacción:', transactionId);
    }

    onRetryPayment(referenceCode: string): void {
        // TODO: Implementar reintento de pago
        console.log('Reintentar pago para referencia:', referenceCode);
        this.router.navigate(['/pagos']);
    }

    onContactSupport(purchaseStatus: PurchaseStatus): void {
        // TODO: Implementar contacto con soporte
        console.log('Contactar soporte para:', purchaseStatus);
        this.router.navigate(['/soporte'], {
            queryParams: {
                transactionId: purchaseStatus.transactionId,
                referenceCode: purchaseStatus.referenceCode
            }
        });
    }

    onCheckStatus(transactionId: string): void {
        // TODO: Implementar verificación de estado
        console.log('Verificar estado de transacción:', transactionId);
        this.processPaymentResponse(); // Re-procesar para actualizar
    }

    onGoHome(): void {
        this.router.navigate(['/']);
    }
}