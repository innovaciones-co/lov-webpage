import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface PqrSubmissionData {
  requestType: string;
  subject: string;
  message: string;
  email: string;
  phone: string;
  fullName: string;
  terms: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PqrService {
  http = inject(HttpClient);
  private readonly gatewayUrl = environment.apiUrl;

  // Signals for state management
  isSubmitting = signal<boolean>(false);
  submissionResult = signal<any>(null);
  submissionError = signal<string | null>(null);

  async submitPqr(data: PqrSubmissionData): Promise<any> {
    this.isSubmitting.set(true);
    this.submissionError.set(null);

    try {
      const payload = {
        type: data.requestType.toUpperCase(),
        subject: data.subject,
        message: data.message,
        email: data.email,
        phone: data.phone.startsWith('+') ? data.phone : `+57${data.phone}`,
        customer: data.fullName
      };

      const url = `${this.gatewayUrl}/pqrs`;
      const response = await firstValueFrom(this.http.post<ApiResponse<any>>(url, payload));

      this.submissionResult.set(response.payload);
      console.debug('PQR submission result:', response);

      return response.payload;
    } catch (error: any) {
      this.submissionError.set(error.message || 'Error submitting PQR');
      this.submissionResult.set(null);
      console.error('Error submitting PQR:', error);
      throw error;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Reset methods
  resetSubmission(): void {
    this.submissionResult.set(null);
    this.submissionError.set(null);
    this.isSubmitting.set(false);
  }
}
