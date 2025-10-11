import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationTabsComponent } from "../../shared/components/navigation-tabs/navigation-tabs";
import { NewPortabilityComponent } from './components/new-portability/new-portability';
import { PortabilityStatusComponent } from './components/portability-status/portability-status';

@Component({
  selector: 'app-portability',
  templateUrl: './portability.html',
  styleUrls: ['./portability.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavigationTabsComponent
  ],
})
export class Portability {

  tabs = [
    {
      id: 'new-portability',
      title: 'Nueva portabilidad',
      component: NewPortabilityComponent,
    },
    {
      id: 'portability-state ',
      title: 'Estado de la portabilidad',
      component: PortabilityStatusComponent,
      inputs: {}
    },
  ];

}
