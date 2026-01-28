import { Injectable, OnDestroy } from '@angular/core';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { OrderResponse, OrderStatus } from '../models/order.model';
import { PaymentService } from './payment.service';

@Injectable({
    providedIn: 'root'
})
export class OrderStatusService implements OnDestroy {
    private readonly POLLING_STATES: OrderStatus[] = ['CREATED', 'PAYMENT', 'COMPLETED'];
    private readonly BASE_DELAY = 1000; // 1 second
    private readonly MAX_ATTEMPTS = 10;
    private stopPolling$ = new Subject<void>();

    constructor(private paymentService: PaymentService) { }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    /**
     * Checks order status once (no polling)
     * @param referenceCode The order reference code
     * @returns Observable with order response
     */
    checkOrderStatus(referenceCode: string): Observable<OrderResponse> {
        return this.paymentService.getOrderByReferenceCode(referenceCode).pipe(
            catchError(error => {
                console.error('Error en petición individual:', error);
                // Si una petición falla, podrías decidir si seguir o frenar. 
                // Aquí lanzamos el error para detener el polling:
                return throwError(() => error);
            })
        );
    }

    /**
     * Checks if a status should continue polling
     * @param status The order status to check
     * @returns True if polling should continue
     */
    shouldPollStatus(status: OrderStatus): boolean {
        return this.POLLING_STATES.includes(status);
    }

    /**
     * Stops any ongoing polling operations
     */
    stopPolling(): void {
        this.stopPolling$.next();
    }

    /**
     * Gets the display text for an order status
     * @param status The order status
     * @returns Human-readable status text
     */
    getStatusDisplayText(status: OrderStatus): string {
        const statusTexts: Record<OrderStatus, string> = {
            'CREATED': 'Creado',
            'CANCELLED': 'Cancelado',
            'COMPLETED': 'Completado',
            'PAYMENT': 'En proceso de pago',
            'PROCESSED': 'Procesado',
            'REFUNDED': 'Reembolsado'
        };

        return statusTexts[status] || status;
    }

    /**
     * Gets the status color class for UI styling
     * @param status The order status
     * @returns CSS class name for status styling
     */
    getStatusColorClass(status: OrderStatus): string {
        const statusColors: Record<OrderStatus, string> = {
            'CREATED': 'status-pending',
            'CANCELLED': 'status-error',
            'COMPLETED': 'status-success',
            'PAYMENT': 'status-processing',
            'PROCESSED': 'status-success',
            'REFUNDED': 'status-warning'
        };

        return statusColors[status] || 'status-default';
    }

    /**
     * Determines if the status indicates success
     * @param status The order status
     * @returns True if the status indicates successful completion
     */
    isSuccessStatus(status: OrderStatus): boolean {
        return status === 'PROCESSED' || status === 'COMPLETED';
    }

    /**
     * Determines if the status indicates failure
     * @param status The order status
     * @returns True if the status indicates failure
     */
    isFailureStatus(status: OrderStatus): boolean {
        return status === 'CANCELLED';
    }

    /**
     * Determines if the status is in a processing state
     * @param status The order status
     * @returns True if the status indicates processing
     */
    isProcessingStatus(status: OrderStatus): boolean {
        return this.POLLING_STATES.includes(status);
    }
}