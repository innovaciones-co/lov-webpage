import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'successful-process',
    templateUrl: './successful-process.html',
    styleUrl: './successful-process.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessfulProcessComponent {
    icon = input.required<string>();
    title = input.required<string>();
}
