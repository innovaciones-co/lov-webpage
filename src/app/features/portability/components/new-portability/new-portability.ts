import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PortabilityInformation, PortabilityInformationData } from '../portability-information-form/portability-information-form.component';
import { PortinInformationFormComponent, PortinInformationData } from '../portin-information-form/portin-information-form.component';
import { CustomerInformationFormComponent, CustomerInformationData } from '../customer-information-form/customer-information-form';

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  imports: [PortabilityInformation, PortinInformationFormComponent, CustomerInformationFormComponent]
})
export class NewPortabilityComponent {

  private http = inject(HttpClient);

  portabilityData = signal<PortabilityInformationData | null>(null);
  portinData = signal<PortinInformationData | null>(null);
  customerData = signal<CustomerInformationData | null>(null);

  currentStepIndex = signal(0);

  nextStep(): void {
    if (this.currentStepIndex() < 2) { // 0, 1, 2 (3 steps total)
      this.currentStepIndex.set(this.currentStepIndex() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.set(this.currentStepIndex() - 1);
    }
  }

  onPortabilityInformationSubmit(data: PortabilityInformationData): void {
    this.portabilityData.set(data);
    console.log('Portability Information Data:', data);
    this.nextStep();
  }

  onPortinInformationSubmit(data: PortinInformationData): void {
    this.portinData.set(data);
    console.log('Portin Information Data:', data);
    this.nextStep();

    /* // Make GET request to lookup donorNumber
    const url = `${environment.apiUrl}/mnp/lookup/${data.donorNumber}`;
    console.log('Making GET request to:', url);

    this.http.get(url).subscribe({
      next: (response) => {
        console.log('MNP Lookup response:', response);
        this.nextStep();
      },
      error: (error) => {
        console.error('MNP Lookup error:', error);
        // For now, no proceeding to next step
        // this.nextStep();
      }
    }); */
  }

  onCustomerInformationSubmit(data: CustomerInformationData): void {
    this.customerData.set(data);
    console.log('Customer Information Data:', data);
    console.log('All Form Data:', {
      portability: this.portabilityData(),
      portin: this.portinData(),
      customer: this.customerData()
    });
    // Here you can submit all the data to your backend
  }

}
