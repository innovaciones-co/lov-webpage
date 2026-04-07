import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./shared/components/footer/footer";
import { Menu } from './shared/components/menu/menu';
import { WhatsappFab } from "./features/whatsapp-fab/whatsapp-fab";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Footer, WhatsappFab],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('lov-webpage');
}
