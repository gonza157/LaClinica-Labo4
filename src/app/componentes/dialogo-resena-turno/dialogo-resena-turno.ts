import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialogo-resena-turno',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-resena-turno.html',
  styleUrl: './dialogo-resena-turno.scss'
})
export class DialogoResenaTurno {

  constructor(
    public dialogRef: MatDialogRef<DialogoResenaTurno>,
    @Inject(MAT_DIALOG_DATA) public data: { resena: string }
  ) { }

}
