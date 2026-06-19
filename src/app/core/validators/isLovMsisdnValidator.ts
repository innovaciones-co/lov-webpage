import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { MsisdnPipe } from "../pipes/msisdn.pipe";
import { SubscriptionService } from "../services/subscription.service";

export function isLovMsisdnValidator(
    subscriptionService: SubscriptionService,
    msisdnPipe: MsisdnPipe
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const value = control.value;

        // Allow empty values (use Validators.required separately if needed)
        if (value === null || value === undefined || value === '') {
            return of(null);
        }

        const formattedMsisdn = msisdnPipe.transform(value);

        return subscriptionService.getSubscriptionsByMsisdn(formattedMsisdn).pipe(
            map((response) => {
                // If subscription exists, it's a valid LOV MSISDN, so no validation error
                return null;
            }),
            catchError((err) => {
                // If subscription does not exist, return validation error
                return of({
                    isLovMsisdn: {
                        value,
                        message: 'Value is not associated with a LOV subscription'
                    }
                });
            })
        );
    };
}