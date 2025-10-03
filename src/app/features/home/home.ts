import { Component } from '@angular/core';
import { Promo } from '../../shared/components/promo/promo';
import { Intro } from '../intro/intro';
import { IntroPortability } from '../intro-portability/intro-portability';
import { Plans } from '../plans/plans';

@Component({
  selector: 'app-home',
  imports: [Promo, Intro, IntroPortability, Plans],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
