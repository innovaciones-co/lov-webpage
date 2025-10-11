import { inject, Injectable } from '@angular/core';
import { distinctUntilChanged, fromEvent, map, Observable, throttleTime } from 'rxjs';
import { DeviceDetectionService } from './device-detection.service';

export interface ScrollPosition {
    scrollY: number;
    documentHeight: number;
    viewportHeight: number;
    isNearBottom: boolean;
    percentageScrolled: number;
}

@Injectable({
    providedIn: 'root'
})
export class ScrollDetectionService {
    private deviceService = inject(DeviceDetectionService);
    private readonly BOTTOM_THRESHOLD = 200; // pixels from bottom

    getScrollPosition$(): Observable<ScrollPosition> {
        if (!this.deviceService.isBrowser()) {
            return new Observable(subscriber => {
                subscriber.next({
                    scrollY: 0,
                    documentHeight: 800,
                    viewportHeight: 600,
                    isNearBottom: false,
                    percentageScrolled: 0
                });
            });
        }

        return fromEvent(window, 'scroll').pipe(
            throttleTime(100), // Throttle scroll events
            map(() => this.calculateScrollPosition()),
            distinctUntilChanged((prev, curr) =>
                prev.isNearBottom === curr.isNearBottom &&
                Math.abs(prev.percentageScrolled - curr.percentageScrolled) < 5
            )
        );
    }

    private calculateScrollPosition(): ScrollPosition {
        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollPosition = scrollY + viewportHeight;
        const isNearBottom = scrollPosition >= documentHeight - this.BOTTOM_THRESHOLD;
        const percentageScrolled = Math.round((scrollY / (documentHeight - viewportHeight)) * 100);

        return {
            scrollY,
            documentHeight,
            viewportHeight,
            isNearBottom,
            percentageScrolled: Math.min(100, Math.max(0, percentageScrolled))
        };
    }

    isNearBottom(threshold: number = this.BOTTOM_THRESHOLD): boolean {
        if (!this.deviceService.isBrowser()) {
            return false;
        }

        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        return scrollPosition >= documentHeight - threshold;
    }

    getScrollPercentage(): number {
        if (!this.deviceService.isBrowser()) {
            return 0;
        }

        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScroll = documentHeight - viewportHeight;

        return maxScroll > 0 ? Math.round((scrollY / maxScroll) * 100) : 0;
    }
}