import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-fab',
  imports: [],
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.scss'
})
export class WhatsappFab {
  phoneNumber = '+573330522222';
  message = 'Hola, quiero más información de Lov 💙';

  openWhatsApp(): void {
    const url = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
    window.open(url, '_blank');
  }
}
