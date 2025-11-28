import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../servicios/auth';
import { MatDialog } from '@angular/material/dialog';
import { DialogoHistoriaClinica } from '../dialogo-historia-clinica/dialogo-historia-clinica';
import { MatIconModule } from '@angular/material/icon';
import { DialogoResenaTurno } from '../dialogo-resena-turno/dialogo-resena-turno';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';

@Component({
  selector: 'app-pacientes-atendidos',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, CapitalizePipe],
  templateUrl: './pacientes-atendidos.html',
  styleUrl: './pacientes-atendidos.scss'
})
export class PacientesAtendidos implements OnInit {
  //private dialog = inject(MatDialog);

  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  pacientes: any[] = [];
  pacienteSeleccionado: any = null;
  turnosPacienteSeleccionado: any[] = [];
  todosTurnos: any[] = []; // Agregar array para almacenar todos los turnos
  cargando = true;

  async ngOnInit() {
    this.cargando = true;
    const user = this.authService.userSignal();
    if (!user) return;

    // 1. Traer todos los turnos realizados/finalizados por el especialista
    const ref = collection(this.firestore, 'turnos');
    const q = query(ref, where('especialistaUid', '==', user.uid));
    const snap = await getDocs(q);

    // 2. Filtrar solo los turnos con estado realizado/finalizado
    const turnos = snap.docs
      .map(d => d.data())
      .filter(t => ['realizado', 'finalizado'].includes(t['estado']));

    this.todosTurnos = turnos; // Guardar todos los turnos

    // 3. Obtener los UID únicos de pacientes
    const pacientesUids = Array.from(new Set(turnos.map(t => t['pacienteUid'])));

    // 4. Traer los datos de los pacientes
    if (pacientesUids.length) {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const pacientesSnap = await getDocs(usuariosRef);
      this.pacientes = pacientesSnap.docs
        .filter(d => d.data()['rol'] === 'paciente' && pacientesUids.includes(d.id))
        .map(d => ({ uid: d.id, ...d.data() }));
    }
    this.cargando = false;
  }

  /*pacientes: any[] = [];
  pacienteSeleccionado: any = null;
  turnosPacienteSeleccionado: any[] = [];

  constructor(private firestore: Firestore, private authService: AuthService) { }

  async ngOnInit() {
    const user = this.authService.userSignal();
    if (!user) {
      // Opcional: mostrar mensaje o redirigir
      this.pacientes = [];
      return;
    }
    const ref = collection(this.firestore, 'turnos');
    const q = query(ref, where('especialistaUid', '==', user.uid), where('estado', '==', 'finalizado'));
    const snap = await getDocs(q);

    const pacientesMap = new Map();
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (!pacientesMap.has(data['pacienteUid'])) {
        pacientesMap.set(data['pacienteUid'], {
          uid: data['pacienteUid'],
          nombre: data['pacienteNombre'],
          apellido: data['pacienteApellido'],
          email: data['pacienteEmail'],
          imagen1: data['pacienteImagen1'],
          favorito: data['favorito'] || false
        });
      }
    });
    this.pacientes = Array.from(pacientesMap.values());
  }*/

  async seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    const user = this.authService.userSignal();
    if (!user) return;
    const ref = collection(this.firestore, 'turnos');
    const q = query(ref,
      where('pacienteUid', '==', paciente.uid),
      where('especialistaUid', '==', user.uid)
    );
    const snap = await getDocs(q);
    this.turnosPacienteSeleccionado = snap.docs.map(d => d.data());
  }

  async toggleFavorito(paciente: any, event: Event) {
    event.stopPropagation(); // Evitar que se ejecute el click del card
    paciente.favorito = !paciente.favorito;
    // Aquí puedes actualizar en Firestore si lo deseas
  }

  getConsultasCount(pacienteUid: string): number {
    return this.todosTurnos.filter(turno => 
      turno.pacienteUid === pacienteUid && 
      ['realizado', 'finalizado'].includes(turno.estado)
    ).length;
  }

  verResena(turno: any) {
    this.dialog.open(DialogoResenaTurno, {
      data: { resena: turno.resena }
    });
  }

  async verHistorialClinicoTurno(turno: any) {
    if (!turno.historiaClinicaId) {
      this.dialog.open(DialogoHistoriaClinica, {
        data: { paciente: { nombre: turno.pacienteNombre, apellido: turno.pacienteApellido }, soloLectura: true }
      });
      return;
    }
    const ref = doc(this.firestore, 'historias-clinicas', turno.historiaClinicaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      this.dialog.open(DialogoHistoriaClinica, {
        data: { paciente: { nombre: turno.pacienteNombre, apellido: turno.pacienteApellido }, soloLectura: true }
      });
      return;
    }
    const historia = snap.data();
    this.dialog.open(DialogoHistoriaClinica, {
      data: { paciente: { nombre: turno.pacienteNombre, apellido: turno.pacienteApellido }, historia, soloLectura: true }
    });
  }

  getEstadoIcon(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'realizado':
      case 'finalizado':
        return 'check_circle';
      case 'pendiente':
        return 'schedule';
      case 'cancelado':
        return 'cancel';
      case 'rechazado':
        return 'block';
      default:
        return 'help_outline';
    }
  }
}
