import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoHistorialClinicoPaciente } from './dialogo-historial-clinico-paciente';

describe('DialogoHistorialClinicoPaciente', () => {
  let component: DialogoHistorialClinicoPaciente;
  let fixture: ComponentFixture<DialogoHistorialClinicoPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoHistorialClinicoPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoHistorialClinicoPaciente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
