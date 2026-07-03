import { Component, ChangeDetectionStrategy, signal, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from '../../../../shared/components/form-fields/radio/radio';

@Component({
  selector: 'app-payment-card-selector',
  imports: [RadioComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './payment-card-selector.html',
  styleUrl: './payment-card-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentCardSelector implements AfterViewInit {
  @ViewChild('cardTemplate1') cardTemplate1?: TemplateRef<any>;
  @ViewChild('cardTemplate2') cardTemplate2?: TemplateRef<any>;
  @ViewChild('cardTemplate3') cardTemplate3?: TemplateRef<any>;

  paymentCardControl = new FormControl('');

  paymentCards = signal<any[]>([]);

  ngAfterViewInit() {
    this.paymentCards.set([
      {
        value: 'card1',
        template: this.cardTemplate1
      },
      {
        value: 'card2',
        template: this.cardTemplate2,
        actionIcon: 'delete',
        actionLabel: 'Eliminar tarjeta'
      },
      {
        value: 'card3',
        template: this.cardTemplate3,
        actionIcon: 'delete',
        actionLabel: 'Eliminar tarjeta'
      }
    ]);
  }

  onCardSelect(cardId: string): void {
    console.log('Tarjeta seleccionada:', cardId);
  }

  onCardAction(cardId: string): void {
    console.log('Acción ejecutada para tarjeta:', cardId);
    // Aquí va tu lógica para eliminar o la acción que necesites
  }
}
