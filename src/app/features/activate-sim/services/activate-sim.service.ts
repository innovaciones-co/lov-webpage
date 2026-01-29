import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
import { PersonalInfoFormData } from "../components/personal-info-form/personal-info-form";

@Injectable({
    providedIn: 'root'
})
export class ActivateSimService {
    private http = inject(HttpClient);
    private readonly gatewayUrl;

    private loading = signal<boolean>(false);
    private success = signal<boolean>(false);
    private documentValidationData = signal<any>(null);
    private iccidValidationData = signal<any>(null);

    constructor() {
        this.gatewayUrl = environment.gatewayUrl;
    }

    validateIccid(iccid: string, puk: string): Observable<any> {
        console.debug('Validating ICCID');
        this.loading.set(true);

        // Primera solicitud GET
        const firstUrl = `${this.gatewayUrl}/api/sim/validate?iccid=${iccid}&puk=${puk}`;

        return this.http.get(firstUrl).pipe(
            switchMap((firstResponse) => {
                console.log('Primera solicitud exitosa:', firstResponse);
                // Segunda solicitud GET - solo se ejecuta si la primera fue exitosa
                const secondUrl = `${this.gatewayUrl}/api/subscriptions?iccid=${iccid}`;
                return this.http.get(secondUrl);
            })
        );
    }

    validateDocument(documentID: string, documentType: string, documentIssueDate: string): Observable<any> {
        console.debug('Validating document');
        this.loading.set(true);

        const url = `${this.gatewayUrl}/api/personal-data/get`;

        // documentIssueDate: YYYY-MM-DDTHH:mm:ss.sssZ
        const issueYear = documentIssueDate.substring(0, 4);

        console.log('Fecha capturada (ISO):', documentIssueDate);
        console.log('Año extraído:', issueYear);

        const body = {
            providerId: "6",
            channel: "CRM",
            user: "232",
            msisdn: "573005555555",
            serviceTypeTo: "CIFIN",
            documentId: documentID,
            documentType: "IDENTIFICATION_CARD",
            verificationValue: issueYear,
            verificationField: "DOCUMENT_ISSUE_YEAR"
        };

        return this.http.post(url, body);
    }

    submitPersonalInfo(data: PersonalInfoFormData) {
        console.debug('Submitting personal info');
        this.loading.set(true);
        this.success.set(false);

        const url = `${this.gatewayUrl}/api/personal-info`;

        return this.http.post(url, data).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set(true);
            },
            error: () => {
                this.loading.set(false);
                this.success.set(false);
            }
        });
    }

    activateSim(personalData: PersonalInfoFormData, documentData: any): Observable<any> {
        console.debug('Activating SIM - Starting three PUT requests');
        this.loading.set(true);

        const iccidData = this.iccidValidationData();
        const customerId = iccidData?.payload?.id;
        const subscription = iccidData?.payload?.subscriptions?.[0]?.id;

        if (!customerId || !subscription) {
            console.error('Missing customerId or subscription from ICCID validation');
            throw new Error('Customer ID or Subscription ID not found');
        }

        // Validation full address PUT request
        const firstUrl = `${this.gatewayUrl}/api/customers/${customerId}/address`;
        const firstBody = {
            country: personalData.country,
            state: personalData.state,
            city: personalData.city,
            line1: personalData.address
        };

        return this.http.put(firstUrl, firstBody).pipe(
            switchMap((firstResponse) => {
                console.log('Primer PUT exitoso:', firstResponse);

                // Validation customer PUT request
                const secondUrl = `${this.gatewayUrl}/api/customers/${customerId}/residential`;
                const secondBody = {
                    consentToShareData: personalData.terms,
                    email: personalData.email,
                    familyName: personalData.lastName,
                    givenName: personalData.name
                };

                return this.http.put(secondUrl, secondBody);
            }),
            switchMap((secondResponse) => {
                console.log('Segundo PUT exitoso:', secondResponse);

                // Activate SIM PUT request
                const thirdUrl = `${this.gatewayUrl}/api/customers/${customerId}/subscriptions/${subscription}/sim/activate`;
                const thirdBody = {
                    transparentData: {
                        documentId: documentData?.documentId || documentData?.documentID,
                        documentType: documentData?.documentType
                    }
                };

                return this.http.put(thirdUrl, thirdBody);
            })
        );
    }

    getLoadingSignal() {
        return this.loading.asReadonly();
    }

    getSuccessSignal() {
        return this.success.asReadonly();
    }

    getDocumentValidationData() {
        return this.documentValidationData.asReadonly();
    }

    setDocumentValidationData(data: any) {
        this.documentValidationData.set(data);
    }

    getIccidValidationData() {
        return this.iccidValidationData.asReadonly();
    }

    setIccidValidationData(data: any) {
        this.iccidValidationData.set(data);
    }

    resetState() {
        this.loading.set(false);
        this.success.set(false);
    }
}
