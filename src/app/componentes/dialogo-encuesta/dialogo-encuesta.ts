import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-dialogo-encuesta',
  imports: [CommonModule, FormsModule, MatRadioModule, MatDialogModule, MatButtonModule],
  templateUrl: './dialogo-encuesta.html',
  styleUrl: './dialogo-encuesta.scss'
})
export class DialogoEncuesta {

  paso = signal(1);
  respuestas = signal({
    calificacion: '',
    dudasResueltas: '',
    recomendacion: '',
    comentario: ''
  });

  constructor(
    public dialogRef: MatDialogRef<DialogoEncuesta>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  siguiente() {
    this.paso.update(p => p + 1);
  }

  anterior() {
    this.paso.update(p => p - 1);
  }

  finalizar() {
    this.dialogRef.close(this.respuestas());
  }

  respuestasValida(): boolean {
    const r = this.respuestas();
    switch (this.paso()) {
      case 1: return !!r.calificacion;
      case 2: return !!r.dudasResueltas;
      case 3: return !!r.recomendacion;
      default: return true;
    }
  }
}
