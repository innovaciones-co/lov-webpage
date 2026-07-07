import { Component, ViewChild, TemplateRef, AfterViewInit, signal, inject, input, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { Modal } from '../../../../shared/components/modal/modal';
import { CreatePaymentMethod } from '../../../payment-methods/create-payment-method/create-payment-method';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { CustomerSubscription } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-payment-card-selector',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule, Modal, CreatePaymentMethod],
  templateUrl: './payment-card-selector.html',
  styleUrl: './payment-card-selector.scss'
})
export class PaymentCardSelector implements AfterViewInit {
  @ViewChild('cardTemplate1') cardTemplate1?: TemplateRef<any>;
  @ViewChild('cardTemplate2') cardTemplate2?: TemplateRef<any>;
  @ViewChild('cardTemplate3') cardTemplate3?: TemplateRef<any>;

  currentSubscription = input<CustomerSubscription | undefined>();

  private dashboardService = inject(DashboardService);

  readonly paymentCardControl = new FormControl<string | null>(null);

  creditCards = signal<any[]>([]);
  loadingCreditCards = signal<boolean>(true);
  isModalOpen = signal(false);
  refreshCreditCards = signal(0);

  paymentCards = signal<any[]>([
    { value: 'card1', template: this.cardTemplate1 },
    { value: 'card2', template: this.cardTemplate2, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' },
    { value: 'card3', template: this.cardTemplate3, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' }
  ]);

  constructor() {
    effect(() => {
      this.refreshCreditCards();
      console.debug('Fetching credit cards');
      this.loadingCreditCards.set(true);
      this.dashboardService.getCreditCards().subscribe({
        next: (response) => {
          const cards = Array.isArray(response) ? response : (response.payload || []);
          this.creditCards.set(cards);
          this.dashboardService.setCreditCardsData(response);
          this.loadingCreditCards.set(false);
        },
        error: (error) => {
          console.error('Error fetching credit cards:', error);
          this.loadingCreditCards.set(false);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.paymentCards.set([
      { value: 'card1', template: this.cardTemplate1 },
      { value: 'card2', template: this.cardTemplate2, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' },
      { value: 'card3', template: this.cardTemplate3, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' }
    ]);
  }

  onCardAction(cardId: string): void {
    // TODO: Implementar lógica para eliminar o la acción que necesites
    console.log('Acción ejecutada para tarjeta:', cardId);
  }

  onEditClick(): void {
    this.isModalOpen.set(true);
  }

  onCancelModal(): void {
    this.isModalOpen.set(false);
  }

  onPaymentMethodSuccess(): void {
    this.isModalOpen.set(false);
    this.refreshCreditCards.update(val => val + 1);
  }
}
