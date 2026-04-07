import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PqrForm } from "./componets/pqr-form/pqr-form";

@Component({
  selector: 'app-pqr',
  imports: [PqrForm],
  templateUrl: './pqr.html',
  styleUrl: './pqr.scss'
})
export class Pqr {
  private router = inject(Router);
  pqrFormData = signal<any>(null);

  onPqrFormSubmit(data: any): void {
    this.pqrFormData.set(data);
    this.router.navigate(['/pqr/confirmacion']);
  }
}
