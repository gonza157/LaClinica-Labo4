import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../servicios/auth';
import { Firestore, collection, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogoResenaTurno } from '../../dialogo-resena-turno/dialogo-resena-turno';

@Component({
  selector: 'app-especialista',
  imports: [
    CommonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './especialista.html',
  styleUrl: './especialista.scss'
})
export class Especialista implements OnInit {
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private dialog = inject(MatDialog);
  
  filtroNombre = '';
  loading = false;
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  pacienteSeleccionado: any = null;
  turnosPaciente: any[] = [];
  historiaClinicaPaciente: any[] = [];

  ngOnInit() {
    this.cargarPacientes();
  }

  async cargarPacientes() {
    this.loading = true;
    try {
      const user = this.authService.userSignal();
      if (!user) return;
      
      // Obtener turnos atendidos por este especialista
      const turnosQuery = query(
        collection(this.firestore, 'turnos'),
        where('especialistaUid', '==', user.uid),
        where('estado', 'in', ['realizado', 'finalizado'])
      );
      
      const turnosSnapshot = await getDocs(turnosQuery);
      const pacientesMap = new Map();
      
      // Agrupar por paciente y contar turnos
      turnosSnapshot.docs.forEach(doc => {
        const turno = doc.data() as any;
        const pacienteUid = turno['pacienteUid'];
        
        if (!pacientesMap.has(pacienteUid)) {
          pacientesMap.set(pacienteUid, {
            uid: pacienteUid,
            nombre: turno['pacienteNombre'],
            email: turno['pacienteEmail'] || '',
            cantidadTurnos: 0,
            imagen1: 'assets/default-avatar.png'
          });
        }
        pacientesMap.get(pacienteUid).cantidadTurnos++;
      });

      // Obtener datos completos de usuarios pacientes
      const usuariosQuery = query(
        collection(this.firestore, 'usuarios'),
        where('rol', '==', 'paciente')
      );
      
      const usuariosSnapshot = await getDocs(usuariosQuery);
      
      usuariosSnapshot.docs.forEach(doc => {
        const usuario = { id: doc.id, ...doc.data() } as any;
        if (pacientesMap.has(usuario['uid'])) {
          const pacienteData = pacientesMap.get(usuario['uid']);
          pacientesMap.set(usuario['uid'], {
            ...pacienteData,
            ...usuario
          });
        }
      });

      this.pacientes = Array.from(pacientesMap.values());
      this.filtrarPacientes();
      
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.loading = false;
    }
  }

  filtrarPacientes() {
    if (!this.filtroNombre.trim()) {
      this.pacientesFiltrados = [...this.pacientes];
    } else {
      const filtro = this.filtroNombre.toLowerCase();
      this.pacientesFiltrados = this.pacientes.filter(p => 
        p.nombre?.toLowerCase().includes(filtro) || 
        p.apellido?.toLowerCase().includes(filtro)
      );
    }
  }

  async seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.loading = true;
    
    try {
      await this.cargarTurnosPaciente();
      await this.cargarHistoriaClinicaPaciente();
    } catch (error) {
      console.error('Error cargando detalles del paciente:', error);
    } finally {
      this.loading = false;
    }
  }

  async cargarTurnosPaciente() {
    const user = this.authService.userSignal();
    if (!user) return;
    
    const turnosQuery = query(
      collection(this.firestore, 'turnos'),
      where('pacienteUid', '==', this.pacienteSeleccionado.uid),
      where('especialistaUid', '==', user.uid),
      orderBy('fecha', 'desc')
    );
    
    const snapshot = await getDocs(turnosQuery);
    this.turnosPaciente = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async cargarHistoriaClinicaPaciente() {
    const user = this.authService.userSignal();
    if (!user) return;
    
    const historiaQuery = query(
      collection(this.firestore, 'historias-clinicas'),
      where('pacienteUid', '==', this.pacienteSeleccionado.uid),
      where('especialistaUid', '==', user.uid),
      orderBy('fecha', 'desc')
    );
    
    const snapshot = await getDocs(historiaQuery);
    this.historiaClinicaPaciente = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  verResena(turno: any) {
    this.dialog.open(DialogoResenaTurno, {
      data: { resena: turno.resena }
    });
  }

  volverALista() {
    this.pacienteSeleccionado = null;
    this.turnosPaciente = [];
    this.historiaClinicaPaciente = [];
  }
}