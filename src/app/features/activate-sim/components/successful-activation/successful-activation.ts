import { Component } from '@angular/core';
import { SuccessfulProcessComponent } from '../../../../shared/components/successful-process/successful-process';

@Component({
  selector: 'app-successful-activation',
  imports: [SuccessfulProcessComponent],
  templateUrl: './successful-activation.html',
  styleUrl: './successful-activation.scss'
})
export class SuccessfulActivation {
  icon = '/email.png';
  title = '¡Tu SIM ha sido activada exitosamente!';
}
