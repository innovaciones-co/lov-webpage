import { Component } from '@angular/core';
import { Promo } from "../../shared/components/promo/promo";
import { Intro } from "../intro/intro";
import { IntroPortability } from "../intro-portability/intro-portability";

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
