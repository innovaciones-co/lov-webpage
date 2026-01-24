import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { PortabilityService } from '../../services/portability.service';
import { CustomerInformationData, CustomerInformationFormComponent } from '../customer-information-form/customer-information-form';
import { PortabilityInformation, PortabilityInformationData } from '../portability-information-form/portability-information-form.component';
import { DonorInformationData, DonorInformationFormComponent } from '../donor-information-form/donor-information-form.component';
import { MsisdnPipe } from '../../../../core/pipes/msisdn.pipe';

@Component({
  selector: 'app-new-portability',
  templateUrl: './new-portability.html',
  styleUrl: './new-portability.scss',
  imports: [PortabilityInformation, DonorInformationFormComponent, CustomerInformationFormComponent]
})
export class NewPortabilityComponent {

  private http = inject(HttpClient);
  private portabilityService = inject(PortabilityService);

  msisdnPipe = inject(MsisdnPipe);


  portabilityData = signal<PortabilityInformationData | null>(null);
  donorData = signal<DonorInformationData | null>(null);
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

  async onPortabilityInformationSubmit(data: PortabilityInformationData): Promise<void> {


    this.portabilityData.set(data);
    console.log('Portability Information Data:', data);
    this.nextStep();
  }

  onDonorInformationSubmit(data: DonorInformationData): void {
    this.donorData.set(data);
    console.log('Donor Information Data:', data);
    this.nextStep();

    // Make GET request to lookup donorNumber
    const transformedDonorNumber = this.msisdnPipe.transform(data.donorNumber);

    const url = `${environment.gatewayUrl}/api/mnp/lookup/${transformedDonorNumber}`;
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
    });
  }

  onCustomerInformationSubmit(data: CustomerInformationData): void {
    this.customerData.set(data);
    console.log('Customer Information Data:', data);
    console.log('All Form Data:', {
      portability: this.portabilityData(),
      donor: this.donorData(),
      customer: this.customerData()
    });
    // Here you can submit all the data to your backend
  }


  // Validate donor number
  async validateDonor() {
    await this.portabilityService.validateDonorNumber('3330701090');

    // Access results via signals
    const isLoading = this.portabilityService.isValidatingDonorNumber();
    const result = this.portabilityService.donorValidationResult();
    const error = this.portabilityService.donorValidationError();
  }

}
