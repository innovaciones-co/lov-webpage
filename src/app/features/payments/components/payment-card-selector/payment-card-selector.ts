import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';
import { Modal } from '../../../../shared/components/modal/modal';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { CreatePaymentMethod } from '../../../payment-methods/create-payment-method/create-payment-method';
import { PaymentService as PaymentMethodsService } from '../../../payment-methods/services/payment-service';
import PaymentMethod, { PaymentMethodPayload } from '../../models/payment-method.model';
import { PaymentService as CheckoutPaymentService } from '../../services/payment.service';

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
  private checkoutPaymentService = inject(CheckoutPaymentService);
  private paymentMethodsService = inject(PaymentMethodsService);

  readonly paymentCardControl = new FormControl<string | null>(null);
  selectedPaymentCardId = toSignal(this.paymentCardControl.valueChanges, { initialValue: null });

  creditCards = signal<PaymentMethodPayload[]>([]);
  loadingCreditCards = signal<boolean>(true);
  isModalOpen = signal(false);
  isDeleteConfirmationModalOpen = signal(false);
  isDeletingCard = signal(false);
  pendingDeleteCardId = signal<string | null>(null);
  refreshCreditCards = signal(0);
  isVisible = signal(false);
  private cardTemplateRef = signal<TemplateRef<any> | undefined>(undefined);

  pendingDeleteCard = computed(() => {
    const pendingDeleteCardId = this.pendingDeleteCardId();
    if (!pendingDeleteCardId) {
      return undefined;
    }

    return this.creditCards().find(card => card.id.toString() === pendingDeleteCardId);
  });

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
      const selectedMethod = this.checkoutPaymentService.paymentMethod();
      if (selectedMethod == PaymentMethod.CARD) {
        this.isVisible.set(true);
      } else {
        this.isVisible.set(false);
      }
    });

    effect(() => {
      if (!this.isVisible()) {
        this.checkoutPaymentService.setSelectedCreditCard(undefined);
        return;
      }

      this.refreshCreditCards();
      this.fetchCreditCards();
    });

    effect(() => {
      const selectedCardId = this.selectedPaymentCardId();
      if (!selectedCardId) {
        this.checkoutPaymentService.setSelectedCreditCard(undefined);
        return;
      }

      const selectedCard = this.creditCards().find(card => card.id.toString() === selectedCardId);
      this.checkoutPaymentService.setSelectedCreditCard(selectedCard);
    });
  }

  private fetchCreditCards(): void {
    console.debug('Fetching credit cards');
    this.loadingCreditCards.set(true);
    this.dashboardService.getCreditCards().subscribe({
      next: (response) => {
        this.creditCards.set(response);
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
    if (!cardId) {
      return;
    }

    this.pendingDeleteCardId.set(cardId);
    this.isDeleteConfirmationModalOpen.set(true);
  }

  onCancelDeleteModal(): void {
    if (this.isDeletingCard()) {
      return;
    }

    this.isDeleteConfirmationModalOpen.set(false);
    this.pendingDeleteCardId.set(null);
  }

  onConfirmDeleteCard(): void {
    const cardId = this.pendingDeleteCardId();
    if (!cardId || this.isDeletingCard()) {
      return;
    }

    this.isDeletingCard.set(true);

    this.paymentMethodsService.deletePaymentMethod(cardId).subscribe({
      next: () => {
        this.creditCards.update(cards => cards.filter(card => card.id.toString() !== cardId));

        if (this.paymentCardControl.value === cardId.toString()) {
          this.paymentCardControl.setValue(null);
        }

        this.isDeleteConfirmationModalOpen.set(false);
        this.pendingDeleteCardId.set(null);
        this.isDeletingCard.set(false);
        this.refreshCreditCards.update(val => val + 1);
      },
      error: (error) => {
        console.error('Error deleting payment method:', error);
        this.isDeletingCard.set(false);
      }
    });
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
