import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../servicios/auth';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialogo-historial-clinico-paciente',
  imports: [CommonModule, FormsModule, MatDialogModule, MatExpansionModule, MatButtonModule],
  templateUrl: './dialogo-historial-clinico-paciente.html',
  styleUrl: './dialogo-historial-clinico-paciente.scss'
})
export class DialogoHistorialClinicoPaciente {
  historiales: any[] = [];
  cargando = true;
  esEspecialista = false;

  constructor(
    private firestore: Firestore,
    public dialogRef: MatDialogRef<DialogoHistorialClinicoPaciente>,
    @Inject(MAT_DIALOG_DATA) public data: { paciente: any },
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.cargando = true;
    // Determina el rol del usuario logueado
    const user = this.authService.userSignal();
    this.esEspecialista = user?.rol === 'especialista';
    const ref = collection(this.firestore, 'historias-clinicas');
    const q = query(ref, where('pacienteUid', '==', this.data.paciente.uid));
    const snap = await getDocs(q);
    this.historiales = snap.docs
      .map(d => d.data())
      .sort((a, b) => new Date(b['fecha']).getTime() - new Date(a['fecha']).getTime());
    this.cargando = false;
  }

  cerrar() {
    this.dialogRef.close();
  }
}
