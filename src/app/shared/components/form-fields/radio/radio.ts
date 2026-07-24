import {
  Component,
  input,
  output,
  inject,
  TemplateRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'radio-field',
  templateUrl: 'radio.html',
  styleUrls: ['./radio.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class RadioComponent {
  private static radioCounter = 0;
  private sanitizer = inject(DomSanitizer);

  id = `radio-${++RadioComponent.radioCounter}-${Math.random().toString(36).substring(7)}`;
  label = input<string>('');
  error = input<string>('');
  options = input<{ label?: string; value: string; template?: TemplateRef<any>; actionIcon?: string; actionLabel?: string }[]>([]);
  control = input.required<FormControl>();
  valueChange = output<string>();
  action = output<string>();

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  onAction(value: string): void {
    this.action.emit(value);
  }

  onChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.control().setValue(value);
    this.valueChange.emit(value);
  }
}
