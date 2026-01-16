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

    constructor() {
        this.gatewayUrl = environment.gatewayUrl;
    }

    validateIccid(iccid: string, puk: string): Observable<any> {
        console.debug('Validating ICCID');
        this.loading.set(true);

        // Primera solicitud GET
        const firstUrl = `${this.gatewayUrl}/sim/validate?iccid=${iccid}&puk=${puk}`;

        return this.http.get(firstUrl).pipe(
            switchMap((firstResponse) => {
                console.log('Primera solicitud exitosa:', firstResponse);
                // Segunda solicitud GET - solo se ejecuta si la primera fue exitosa
                const secondUrl = `${this.gatewayUrl}/subscriptions?iccid=${iccid}`;
                return this.http.get(secondUrl);
            })
        );
    }

    validateDocument(documentID: string, documentType: string, documentIssueDate: Date): Observable<any> {
        console.debug('Validating document');
        this.loading.set(true);

        const url = `${this.gatewayUrl}/personal-data/get`;

        // Convertir a Date si es necesario y extraer el año
        const date = documentIssueDate instanceof Date ? documentIssueDate : new Date(documentIssueDate);
        const issueYear = date.getFullYear().toString();

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

        const url = `${this.gatewayUrl}/personal-info`; // TODO: Reemplazar con la URL correcta

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

    setLoading(loading: boolean) {
        this.loading.set(loading);
    }

    resetState() {
        this.loading.set(false);
        this.success.set(false);
    }
}
