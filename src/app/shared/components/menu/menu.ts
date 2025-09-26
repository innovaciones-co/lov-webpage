import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';

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

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    this.removeActiveFromDropdowns();
  }

  private removeActiveFromDropdowns(): void {
    const dropdownItems = this.navMenuRef.nativeElement.querySelectorAll('.nav-item.dropdown');
    dropdownItems.forEach(item => {
      item.classList.remove('active');
    });
  }

  toggleDropdown(event: Event): void {
    // Only work on small devices (screen width less than 768px)
    if (window.innerWidth >= 768) {
      return;
    }
    
    const target = event.target as HTMLElement;
    const dropdownMenu = target.parentElement;

    if (dropdownMenu) {
      // Remove 'active' class from all siblings of the parent element
      const parentOfParent = dropdownMenu.parentElement;
      if (parentOfParent) {
        const siblings = parentOfParent.children;
        Array.from(siblings).forEach(sibling => {
          if (sibling !== dropdownMenu) {
            sibling.classList.remove('active');
          }
        });
      }

      // Toggle 'active' class on current element
      dropdownMenu.classList.toggle('active');
    }
  }
}