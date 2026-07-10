import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { Modal } from '../../../../shared/components/modal/modal';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { CreatePaymentMethod } from '../../../payment-methods/create-payment-method/create-payment-method';
import PaymentMethod from '../../models/payment-method.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-card-selector',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule, Modal, CreatePaymentMethod],
  templateUrl: './payment-card-selector.html',
  styleUrl: './payment-card-selector.scss'
})
export class PaymentCardSelector {
  @ViewChild('addCardTemplate') addCardTemplate?: TemplateRef<any>;
  @ViewChild('cardTemplate')
  set cardTemplate(value: TemplateRef<any> | undefined) {
    this.cardTemplateRef.set(value);
  }

  currentSubscription = input<CustomerSubscription | undefined>();

  private dashboardService = inject(DashboardService);
  private paymentService = inject(PaymentService);

  readonly paymentCardControl = new FormControl<string | null>(null);

  creditCards = signal<any[]>([]);
  loadingCreditCards = signal<boolean>(true);
  isModalOpen = signal(false);
  refreshCreditCards = signal(0);
  isVisible = signal(false);
  private cardTemplateRef = signal<TemplateRef<any> | undefined>(undefined);

  paymentCards = computed(() => {
    const cardTemplate = this.cardTemplateRef();
    const options: any[] = [];

    // Opciones para cada tarjeta guardada
    this.creditCards()
      .filter(card => card.truncatedNumber)
      .forEach((card: any) => {
        options.push({
          value: card.id,
          template: cardTemplate,
          actionIcon: 'delete',
          actionLabel: 'Eliminar tarjeta',
          card: card,
          issuer: card.issuer,
          truncatedNumber: card.truncatedNumber,
          expiration: card.expiryMonth + '/' + card.expiryYear.toString().slice(-2),
        });
      });

    return options;
  });

  constructor() {
    effect(() => {
      const selectedMethod = this.paymentService.paymentMethod();
      if (selectedMethod == PaymentMethod.CARD) {
        this.isVisible.set(true);
      } else {
        this.isVisible.set(false);
      }
    });

    effect(() => {
      if (!this.isVisible()) {
        return;
      }

      this.refreshCreditCards();
      this.fetchCreditCards();
    });
  }

  private fetchCreditCards(): void {
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

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
