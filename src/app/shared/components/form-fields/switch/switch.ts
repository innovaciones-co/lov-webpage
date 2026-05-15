import {
    Component,
    ChangeDetectionStrategy,
    input,
    output,
    signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'switch-field',
    templateUrl: './switch.html',
    styleUrls: ['./switch.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule],
})
export class SwitchComponent {
    id = signal<string>('switch-' + Math.random().toString(36).substring(2));
    activeLabel = input<string>('Active');
    inactiveLabel = input<string>('Inactive');
    control = input<FormControl>(new FormControl(false));
    valueChange = output<boolean>();

    displayLabel() {
        const isActive = this.control().value;
        return isActive ? this.activeLabel() : this.inactiveLabel();
    }

    toggleSwitch() {
        const newValue = !this.control().value;
        this.control().setValue(newValue);
        this.valueChange.emit(newValue);
    }
}
