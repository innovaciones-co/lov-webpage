import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessfulProcessComponent } from './successful-process';

describe('SuccessfulProcessComponent', () => {
    let component: SuccessfulProcessComponent;
    let fixture: ComponentFixture<SuccessfulProcessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SuccessfulProcessComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SuccessfulProcessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
