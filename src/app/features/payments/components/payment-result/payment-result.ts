import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { OrderResponse, PaymentStatus } from '../../models/order.model';
import { PaymentService } from '../../services/payment.service';
import { Loading } from "../../../../shared/components/loading/loading";
import { MsisdnPipe } from "../../../../core/pipes/msisdn.pipe";

@Component({
    selector: 'app-payment-result',
    imports: [CurrencyPipe, AsyncPipe, Loading, MsisdnPipe],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentResultComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private paymentService = inject(PaymentService);

    private readonly referenceCode = this.route.snapshot.queryParams['referenceCode'] as string | null ?? null;
    private readonly BASE_DELAY = 1000;
    private readonly MAX_POLL_ATTEMPTS = 8;
    private readonly refresh$ = new BehaviorSubject<void>(undefined);
    private readonly destroy$ = new Subject<void>();

    error = signal<string | null>(null);
    private _latestOrder: OrderResponse | null = null;

    order$: Observable<OrderResponse>;

    constructor() {

        if (!this.referenceCode) {
            this.error.set('Código de referencia no proporcionado.');
            this.order$ = of(); // Observable vacío
            return;
        }

        this.order$ = this.paymentService.pullOrderByReferenceCode(this.referenceCode!);
    }


    // 🔁 Refresh manually
    onCheckStatus(): void {
        this.error.set(null);
        this.refresh$.next();
    }

    // Helper methods for template
    getStatusDisplayText(status: PaymentStatus): string {
        const statusTexts: Record<PaymentStatus, string> = {
            'INITIATED': 'Iniciado',
            'PENDING': 'Pendiente',
            'APPROVED': 'Aprobado',
            'DECLINED': 'Rechazado',
            'ERROR': 'Error',
            'EXPIRED': 'Expirado',
            'CANCELLED': 'Cancelado',
            'REFUNDED': 'Reembolsado'
        };
        return statusTexts[status] ?? status;
    }

    getStatusColorClass(status: PaymentStatus): string {
        const statusColors: Record<PaymentStatus, string> = {
            'INITIATED': 'status-pending',
            'PENDING': 'status-processing',
            'APPROVED': 'status-success',
            'DECLINED': 'status-error',
            'ERROR': 'status-error',
            'EXPIRED': 'status-error',
            'CANCELLED': 'status-error',
            'REFUNDED': 'status-warning'
        };
        return statusColors[status] ?? 'status-default';
    }

    isSuccessStatus(status: PaymentStatus): boolean {
        return status === 'APPROVED';
    }

    isFailureStatus(status: PaymentStatus): boolean {
        return status === 'DECLINED' || status === 'ERROR' || status === 'EXPIRED' || status === 'CANCELLED';
    }

    isProcessingStatus(status: PaymentStatus): boolean {
        return status === 'INITIATED' || status === 'PENDING';
    }

    onGoToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    onDownloadReceipt(): void {
        const order = this._latestOrder;
        if (order?.transactionId) {
            // TODO: Implement receipt download
            console.log('Download receipt for transaction:', order.transactionId);
        }
    }

    onRetryPayment(): void {
        const order = this._latestOrder;
        if (order?.referenceCode) {
            console.log('Retry payment for reference:', order.referenceCode);
            this.router.navigate(['/pagos']);
        }
    }

    onContactSupport(): void {
        const order = this._latestOrder;
        if (order) {
            console.log('Contact support for order:', order);
            this.router.navigate(['/soporte'], {
                queryParams: {
                    transactionId: order.transactionId,
                    referenceCode: order.referenceCode
                }
            });
        }
    }
}
