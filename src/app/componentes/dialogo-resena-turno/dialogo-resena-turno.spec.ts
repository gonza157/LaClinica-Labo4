import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoResenaTurno } from './dialogo-resena-turno';

describe('DialogoResenaTurno', () => {
  let component: DialogoResenaTurno;
  let fixture: ComponentFixture<DialogoResenaTurno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoResenaTurno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoResenaTurno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
