import { Component } from '@angular/core';
import { Promo } from "../../shared/components/promo/promo";
import { Faq } from "../faq/faq";
import { IntroPortability } from "../intro-portability/intro-portability";
import { Intro } from "../intro/intro";

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability, Faq],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
