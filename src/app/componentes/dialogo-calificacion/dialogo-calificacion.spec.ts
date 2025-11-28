import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCalificacion } from './dialogo-calificacion';

describe('DialogoCalificacion', () => {
  let component: DialogoCalificacion;
  let fixture: ComponentFixture<DialogoCalificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoCalificacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoCalificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
