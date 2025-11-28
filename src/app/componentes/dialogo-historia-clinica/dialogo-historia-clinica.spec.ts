import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoHistoriaClinica } from './dialogo-historia-clinica';

describe('DialogoHistoriaClinica', () => {
  let component: DialogoHistoriaClinica;
  let fixture: ComponentFixture<DialogoHistoriaClinica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoHistoriaClinica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoHistoriaClinica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
