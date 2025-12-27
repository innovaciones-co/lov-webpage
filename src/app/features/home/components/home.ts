import { Component } from '@angular/core';
import { Promo } from '../../../shared/components/promo/promo';
import { IntroPortability } from '../../intro-portability/intro-portability';
import { Intro } from '../../intro/intro';
import { PlansIntro } from '../../plans/components/plans-intro/plans-intro';

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability, PlansIntro],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home { }
