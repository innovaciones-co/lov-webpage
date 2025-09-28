import { Component } from '@angular/core';
import { Promo } from "../../shared/components/promo/promo";
import { Intro } from "../intro/intro";

@Component({
  selector: 'app-home',
  imports: [Promo, Intro],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
