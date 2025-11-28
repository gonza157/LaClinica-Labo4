import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-comentario',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './dialogo-comentario.html',
  styleUrl: './dialogo-comentario.scss'
})
export class DialogoComentario {
  comentario = '';
  soloLectura = false;

  constructor(
    public dialogRef: MatDialogRef<DialogoComentario>,
    @Inject(MAT_DIALOG_DATA) public data: { titulo: string, comentario?: string, soloLectura?: boolean }
  ) {
    if (data.comentario) {
      this.comentario = data.comentario;
    }

    if (typeof data.soloLectura === 'boolean') {
      this.soloLectura = data.soloLectura;
    }
  }
}
