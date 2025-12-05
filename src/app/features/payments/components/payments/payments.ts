import { Component } from '@angular/core';
import { Summary } from "../summary/summary";
import { BillingInfoComponent } from "../billing-info/billing-info";

@Component({
  selector: 'app-payments',
  imports: [Summary, BillingInfoComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments {

}
