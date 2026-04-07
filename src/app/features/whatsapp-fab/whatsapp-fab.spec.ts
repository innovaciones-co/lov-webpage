import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappFab } from './whatsapp-fab';

describe('WhatsappFab', () => {
  let component: WhatsappFab;
  let fixture: ComponentFixture<WhatsappFab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappFab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappFab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
