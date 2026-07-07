import { Component, ViewChild, TemplateRef, signal, inject, input, effect, computed } from '@angular/core';
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
export class PaymentCardSelector {
  @ViewChild('addCardTemplate') addCardTemplate?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;

  currentSubscription = input<CustomerSubscription | undefined>();

  private dashboardService = inject(DashboardService);

  readonly paymentCardControl = new FormControl<string | null>(null);

  creditCards = signal<any[]>([]);
  loadingCreditCards = signal<boolean>(true);
  isModalOpen = signal(false);
  refreshCreditCards = signal(0);

  paymentCards = computed(() => {
    const options: any[] = [];

    // Opciones para cada tarjeta guardada
    this.creditCards()
      .filter(card => card.truncatedNumber)
      .forEach((card: any) => {
        options.push({
          value: card.id,
          template: this.cardTemplate,
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
