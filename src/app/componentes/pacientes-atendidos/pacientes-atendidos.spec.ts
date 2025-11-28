import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesAtendidos } from './pacientes-atendidos';

describe('PacientesAtendidos', () => {
  let component: PacientesAtendidos;
  let fixture: ComponentFixture<PacientesAtendidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesAtendidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesAtendidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
