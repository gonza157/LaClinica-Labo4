import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoEncuesta } from './dialogo-encuesta';

describe('DialogoEncuesta', () => {
  let component: DialogoEncuesta;
  let fixture: ComponentFixture<DialogoEncuesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoEncuesta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoEncuesta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
