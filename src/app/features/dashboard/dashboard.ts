import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { User } from '../authentication/models/auth.models';
import { AuthService } from '../authentication/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="user-info">
          @if (user) {
            <span>Bienvenido, {{ user.firstName }} {{ user.lastName }}</span>
            <button class="logout-btn" (click)="logout()">Cerrar sesión</button>
          }
        </div>
      </header>
      
      <main class="dashboard-content">
        <p>Esta es una página protegida que requiere autenticación.</p>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logout-btn {
      padding: 8px 16px;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .logout-btn:hover {
      background: #ff3838;
    }
    
    .dashboard-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  user: User | null = null;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
