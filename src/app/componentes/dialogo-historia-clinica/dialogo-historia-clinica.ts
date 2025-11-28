import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SoloNumerosDirective } from '../../directivas/solo-numeros.directive';

@Component({
  selector: 'app-dialogo-historia-clinica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, SoloNumerosDirective],
  templateUrl: './dialogo-historia-clinica.html',
  styleUrl: './dialogo-historia-clinica.scss'
})
export class DialogoHistoriaClinica {
  form: FormGroup;
  dinamicos: { clave: string; valor: string }[] = [];

  clave: string = '';
  valor: string = '';

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<DialogoHistoriaClinica>,
    @Inject(MAT_DIALOG_DATA) public data: { paciente: any, historia?: any, soloLectura?: boolean }) {
    if (data.historia) {
      // Modo solo lectura: carga los datos en el form y deshabilita
      this.form = this.fb.group({
        altura: [{ value: data.historia.altura, disabled: true }],
        peso: [{ value: data.historia.peso, disabled: true }],
        temperatura: [{ value: data.historia.temperatura, disabled: true }],
        presion: [{ value: data.historia.presion, disabled: true }]
      });
      this.dinamicos = data.historia.dinamicos || [];
    } else {
      // Modo carga normal
      this.form = this.fb.group({
        altura: ['', Validators.required],
        peso: ['', Validators.required],
        temperatura: ['', Validators.required],
        presion: ['', Validators.required]
      });
    }
  }

  agregarDinamico() {
    if (this.clave && this.valor && this.dinamicos.length < 3) {
      this.dinamicos.push({ clave: this.clave, valor: this.valor });
      this.clave = '';
      this.valor = '';
    }
  }

  eliminarDinamico(i: number) {
    this.dinamicos.splice(i, 1);
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        dinamicos: this.dinamicos
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
