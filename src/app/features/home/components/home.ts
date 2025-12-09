import { Component } from '@angular/core';
import { Promo } from '../../../shared/components/promo/promo';
import { IntroPortability } from '../../intro-portability/intro-portability';
import { Intro } from '../../intro/intro';
import { Plans } from '../../plans/components/plans/plans';

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability, Plans],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home { }
