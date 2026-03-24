import { Component } from '@angular/core';
import { Promo } from '../../../shared/components/promo/promo';
import { IntroPortability } from '../../intro-portability/intro-portability';
import { Intro } from '../../intro/intro';
import { PlansIntro } from '../../plans/components/plans-intro/plans-intro';
import { GetSim } from "../../get-sim/get-sim";

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability, PlansIntro, GetSim],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home { }
