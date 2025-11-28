import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-calificacion',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './dialogo-calificacion.html',
  styleUrl: './dialogo-calificacion.scss'
})
export class DialogoCalificacion {
  estrellas = 0;
  comentario = '';
  hoverEstrella = 0;

  constructor(
    public dialogRef: MatDialogRef<DialogoCalificacion>,
    @Inject(MAT_DIALOG_DATA) public data: { titulo: string }
  ) {}

  setEstrellas(num: number) {
    this.estrellas = num;
  }

  setHover(num: number) {
    this.hoverEstrella = num;
  }

  resetHover() {
    this.hoverEstrella = 0;
  }

  aceptar() {
    if (this.estrellas > 0) this.dialogRef.close({ estrellas: this.estrellas, comentario: this.comentario });
  }
}
