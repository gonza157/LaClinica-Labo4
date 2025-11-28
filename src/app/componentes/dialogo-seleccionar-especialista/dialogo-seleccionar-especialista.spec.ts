import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoSeleccionarEspecialista } from './dialogo-seleccionar-especialista';

describe('DialogoSeleccionarEspecialista', () => {
  let component: DialogoSeleccionarEspecialista;
  let fixture: ComponentFixture<DialogoSeleccionarEspecialista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoSeleccionarEspecialista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoSeleccionarEspecialista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
