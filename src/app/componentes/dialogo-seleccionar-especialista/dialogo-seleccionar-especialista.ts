import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialogo-seleccionar-especialista',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatSelectModule],
  templateUrl: './dialogo-seleccionar-especialista.html',
  styleUrl: './dialogo-seleccionar-especialista.scss'
})
export class DialogoSeleccionarEspecialista {
  especialista: string = '';
  especialistas: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogoSeleccionarEspecialista>,
    @Inject(MAT_DIALOG_DATA) public data: { especialistas: string[] }
  ) {
    this.especialistas = data.especialistas || [];
  }
}

