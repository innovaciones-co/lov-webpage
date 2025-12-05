import { Component } from '@angular/core';
import { BillingInfo } from "./billing-info/billing-info";
import { Summary } from "./summary/summary";

@Component({
  selector: 'app-payments',
  imports: [BillingInfo, Summary],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class Payments {

}
