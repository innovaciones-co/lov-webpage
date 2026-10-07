import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { LovHeart } from '../../shared/components/lov-heart/lov-heart';

@Component({
  selector: 'app-intro-portability',
  imports: [RouterLink, LovHeart],
  templateUrl: './intro-portability.html',
  styleUrl: './intro-portability.scss'
})
export class IntroPortability {

}
