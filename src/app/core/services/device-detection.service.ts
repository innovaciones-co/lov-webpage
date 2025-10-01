import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DeviceDetectionService {
    private platformId = inject(PLATFORM_ID);

    isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    isMobile(): boolean {
        if (!this.isBrowser()) {
            return false; // Default to desktop on server
        }
        return window.innerWidth < 768;
    }

    isTablet(): boolean {
        if (!this.isBrowser()) {
            return false;
        }
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    isDesktop(): boolean {
        if (!this.isBrowser()) {
            return true; // Default to desktop on server
        }
        return window.innerWidth >= 1024;
    }

    getScreenWidth(): number {
        if (!this.isBrowser()) {
            return 1200; // Default desktop width on server
        }
        return window.innerWidth;
    }

    getScreenHeight(): number {
        if (!this.isBrowser()) {
            return 800; // Default desktop height on server
        }
        return window.innerHeight;
    }

    scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
        if (this.isBrowser()) {
            window.scrollTo({ top: 0, behavior });
        }
    }
}