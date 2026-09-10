import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../features/authentication/services/auth.service';
import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;

  beforeEach(async () => {
    const routerEventsSubject = new Subject();
    const mockRouter = {
      url: '/',
      events: routerEventsSubject.asObservable(),
      navigate: jasmine.createSpy('navigate'),
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as any),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/')
    };

    const mockAuthService = {
      user$: of(null),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu', () => {
    expect(component.isActive).toBeFalsy();
    component.onClick();
    expect(component.isActive).toBeTruthy();
    component.onClick();
    expect(component.isActive).toBeFalsy();
  });
});
