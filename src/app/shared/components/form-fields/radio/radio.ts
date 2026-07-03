import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  EventEmitter,
  signal,
  inject,
  TemplateRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'radio-field',
  templateUrl: 'radio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./radio.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class RadioComponent {
  private sanitizer = inject(DomSanitizer);

  id = signal<string>('radio-' + Math.random().toString(36).substring(2));
  label = input<string>('');
  error = input<string>('');
  options = input<{ label?: string; value: string; template?: TemplateRef<any> }[]>([]);
  control = input<FormControl>(new FormControl(''));
  valueChange = output<string>();

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || ''; // SecurityContext.HTML = 1
  }

  onBlur() {
    if (this.control().valid) {
      this.valueChange.emit(this.control().value);
    }
  }
}
