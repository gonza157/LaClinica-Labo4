import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoComentario } from './dialogo-comentario';

describe('DialogoComentario', () => {
  let component: DialogoComentario;
  let fixture: ComponentFixture<DialogoComentario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoComentario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoComentario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
