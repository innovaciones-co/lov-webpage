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

  currentSubscription = input<CustomerSubscription | null | undefined>();
  selectorEnabled = input(true);

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
          // Stringified to match paymentCardControl's string values (radio.html's
          // [checked] does a strict === against this), and how selectedPaymentCardId's
          // lookup effect below already compares (`card.id.toString() === selectedCardId`).
          value: card.id.toString(),
          template: cardTemplate,
          actionIcon: 'delete',
          actionLabel: 'Eliminar tarjeta',
          card: card,
          issuer: card.issuer,
          truncatedNumber: card.truncatedNumber,
          expiration: this.formatExpiration(card),
        });
      });

    return options;
  });

  listedCards = computed(() =>
    this.creditCards()
      .filter(card => card.truncatedNumber)
      .map(card => ({
        id: card.id.toString(),
        issuer: card.issuer,
        truncatedNumber: card.truncatedNumber,
        expiration: this.formatExpiration(card),
      }))
  );

  // OnePay-tokenized cards don't carry expiration data locally (PaymentMethodDTO only
  // stores id/issuer/truncatedNumber for them), unlike legacy PayU-gateway cards which
  // always had expiryMonth/expiryYear — so this can't assume either is present.
  private formatExpiration(card: { expiryMonth?: number | null; expiryYear?: number | null }): string {
    if (card.expiryMonth == null || card.expiryYear == null) {
      return '';
    }
    return `${card.expiryMonth}/${card.expiryYear.toString().slice(-2)}`;
  }

  constructor() {
    effect(() => {
      const selectedMethod = this.checkoutPaymentService.paymentMethod();
      if (!this.selectorEnabled() || selectedMethod == PaymentMethod.CARD) {
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
      if (!this.selectorEnabled()) {
        this.checkoutPaymentService.setSelectedCreditCard(undefined);
        return;
      }

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

  onListDelete(cardId: string): void {
    this.onCardAction(cardId);
  }

  onCancelModal(): void {
    this.isModalOpen.set(false);
  }

  onPaymentMethodSuccess(newPaymentMethodId: number): void {
    this.isModalOpen.set(false);
    // Auto-select the card that was just created — whether it came from the inline form
    // (no saved cards yet) or from the "add another card" modal — so the customer doesn't
    // have to find and click it again in the list before paying.
    this.paymentCardControl.setValue(newPaymentMethodId.toString());
    this.refreshCreditCards.update(val => val + 1);
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
