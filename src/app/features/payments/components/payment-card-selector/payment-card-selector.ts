import { Component, ViewChild, TemplateRef, AfterViewInit, signal, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';

@Component({
  selector: 'app-payment-card-selector',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './payment-card-selector.html',
  styleUrl: './payment-card-selector.scss'
})
export class PaymentCardSelector implements AfterViewInit {
  @ViewChild('cardTemplate1') cardTemplate1?: TemplateRef<any>;
  @ViewChild('cardTemplate2') cardTemplate2?: TemplateRef<any>;
  @ViewChild('cardTemplate3') cardTemplate3?: TemplateRef<any>;

  readonly paymentCardControl = new FormControl<string | null>(null);

  paymentCards = signal<any[]>([
    { value: 'card1', template: this.cardTemplate1 },
    { value: 'card2', template: this.cardTemplate2, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' },
    { value: 'card3', template: this.cardTemplate3, actionIcon: 'delete', actionLabel: 'Eliminar tarjeta' }
  ]);

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
}
