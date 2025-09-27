import { Component } from '@angular/core';
import { Promo } from "../promo/promo";

@Component({
  selector: 'app-home',
  imports: [Promo],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
