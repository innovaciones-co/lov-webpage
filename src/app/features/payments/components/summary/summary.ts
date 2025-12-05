import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Summary {
}
