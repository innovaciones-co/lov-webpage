import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  standalone: true,
})
export class Menu implements OnInit {
  isActive = false;

  @ViewChild('navMenu', { static: true }) navMenuRef!: ElementRef<HTMLUListElement>;

  ngOnInit() {
    const navLinks = this.navMenuRef.nativeElement.querySelectorAll<HTMLAnchorElement>('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = link.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        link.style.setProperty('--hover-x', `${x}%`);
      });
      link.addEventListener('mouseleave', () => {
        link.style.removeProperty('--hover-x');
      });
    });
  }

  onClick() {
    this.isActive = !this.isActive;
  }
}