import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Turnos } from '../../modelos/turnos';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DialogoComentario } from '../dialogo-comentario/dialogo-comentario';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DialogoEncuesta } from '../dialogo-encuesta/dialogo-encuesta';
import { DialogoCalificacion } from '../dialogo-calificacion/dialogo-calificacion';
import { MatCardModule } from '@angular/material/card';
import { DialogoHistoriaClinica } from '../dialogo-historia-clinica/dialogo-historia-clinica';
import { MatIconModule } from '@angular/material/icon';
import { HistoriaClinica } from '../../modelos/historia-clinica';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule, MatButtonModule, MatSnackBarModule, MatCardModule, MatIconModule],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss'
})
export class MisTurnos implements OnInit {
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  filtro1 = '';
  filtro2 = '';
  turnos: Turnos[] = [];
  user: any = null;
  rol: 'paciente' | 'especialista' | 'admin' | null = null;
  mostrarPrevios = false;
  filtroGlobal = '';

  ngOnInit() {
    this.user = this.authService.userSignal();
    this.rol = this.user?.rol || null;
    this.cargarTurnos();
  }

  async cargarTurnos() {
    const ref = collection(this.firestore, 'turnos');
    let q;

    if (this.rol === 'paciente') {
      q = query(ref, where('pacienteUid', '==', this.user.uid));
    } else if (this.rol === 'especialista') {
      q = query(ref, where('especialistaUid', '==', this.user.uid));
    } else if (this.rol === 'admin') {
      q = ref; // Admin puede ver todos los turnos
    } else {
      this.turnos = [];
      return;
    }

    const snap = await getDocs(q);
    this.turnos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Turnos));

    // Trae todos los historiales clínicos del usuario (o todos si es admin)
    let historias: any[] = [];
    if (this.rol === 'paciente') {
      const hcSnap = await getDocs(query(collection(this.firestore, 'historias-clinicas'), where('pacienteUid', '==', this.user.uid)));
      //historias = hcSnap.docs.map(d => d.data());
      historias = hcSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else if (this.rol === 'especialista') {
      // Obtén todos los pacienteUid de los turnos de este especialista
      const pacienteUids = Array.from(new Set(this.turnos.map(t => t.pacienteUid)));
      // Trae todos los historiales clínicos de esos pacientes
      const historiasSnap = await getDocs(collection(this.firestore, 'historias-clinicas'));
      historias = historiasSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as HistoriaClinica))
        .filter(h => pacienteUids.includes(h.pacienteUid) && h.especialistaUid === this.user.uid);
    } else if (this.rol === 'admin') {
      const hcSnap = await getDocs(collection(this.firestore, 'historias-clinicas'));
      //historias = hcSnap.docs.map(d => d.data());
      historias = hcSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Asocia el historial clínico a cada turno usando historiaClinicaId
    this.turnos = this.turnos.map(turno => {
      let historia = null;
      if (turno.historiaClinicaId) {
        historia = historias.find(h => h.id === turno.historiaClinicaId);
      } else {
        // fallback por coincidencia de paciente, especialista y fecha (por si hay turnos viejos)
        historia = historias.find(h =>
          h.pacienteUid === turno.pacienteUid &&
          h.especialistaUid === turno.especialistaUid &&
          fechasIguales(turno.fecha, h.fecha)
        );
      }
      return { ...turno, historiaClinica: historia || null };
    });
  }

  // Filtros dinámicos según el rol
  get turnosFiltrados() {
    // Filtrado por texto según rol (igual que antes)
    let filtrados = this.turnos;

    if (this.filtroGlobal.trim()) {
      const filtro = this.filtroGlobal.trim().toLowerCase();

      filtrados = filtrados.filter(turno => {
        // Convierte todos los campos del turno a un solo string
        let datos = Object.values(turno)
          .map(v => typeof v === 'object' ? JSON.stringify(v) : String(v))
          .join(' ')
          .toLowerCase();

        // Si tiene historia clínica, inclúyela
        if (turno.historiaClinica) {
          datos += ' ' + JSON.stringify(turno.historiaClinica).toLowerCase();
        }

        return datos.includes(filtro);
      });
    }

    // Agrupa y ordena
    const estadosPrimero = ['aceptado', 'pendiente', 'realizado'];
    const estadosUltimo = ['cancelado', 'rechazado', 'finalizado'];

    // Helper para parsear fecha y hora
    const parseFecha = (turno: any) => {
      // Asume formato "YYYY-MM-DD HH:mm"
      const [fecha, hora] = turno.fecha.split(' ');
      return new Date(`${fecha}T${hora || '00:00'}`);
    };

    // Ordena de más próxima a más lejana
    const ordenarAsc = (a: any, b: any) => parseFecha(a).getTime() - parseFecha(b).getTime();
    // Ordena de más reciente a más antigua
    const ordenarDesc = (a: any, b: any) => parseFecha(b).getTime() - parseFecha(a).getTime();

    const primero = filtrados
      .filter(t => estadosPrimero.includes(t.estado))
      .sort(ordenarAsc);

    const ultimo = filtrados
      .filter(t => estadosUltimo.includes(t.estado))
      .sort(ordenarDesc);

    return [...primero, ...ultimo];
  }

  get turnosActuales() {
    const estados = ['aceptado', 'pendiente', 'realizado'];
    return this.turnosFiltrados.filter(t => estados.includes(t.estado));
  }

  get turnosPrevios() {
    const estados = ['cancelado', 'rechazado', 'finalizado'];
    return this.turnosFiltrados.filter(t => estados.includes(t.estado));
  }

  // Acciones PACIENTE
  puedeCancelarPaciente(turno: Turnos) {
    return this.rol === 'paciente' && turno.estado === 'pendiente';
  }
  puedeVerResena(turno: Turnos) {
    return !!turno.resena;
  }
  puedeCompletarEncuesta(turno: Turnos) {
    return this.rol === 'paciente' && turno.estado === 'realizado' && turno.resena && !turno.encuestaCompletada;
  }
  puedeCalificar(turno: Turnos) {
    return this.rol === 'paciente' && turno.estado === 'realizado' && !turno.calificacion;
  }

  // Acciones ESPECIALISTA
  puedeCancelarEspecialista(turno: Turnos) {
    return this.rol === 'especialista' && turno.estado === 'pendiente';
  }
  puedeRechazar(turno: Turnos) {
    return this.rol === 'especialista' && turno.estado === 'pendiente';
  }
  puedeAceptar(turno: Turnos) {
    return this.rol === 'especialista' && turno.estado === 'pendiente';
  }
  puedeFinalizar(turno: Turnos) {
    return this.rol === 'especialista' && turno.estado === 'aceptado';
  }
  puedeCargarHistoriaClinica(turno: Turnos) {
    return this.rol === 'especialista' && turno.estado === 'realizado';
  }

  // Acciones ADMIN
  puedeCancelarAdmin(turno: Turnos) {
    return this.rol === 'admin' && turno.estado === 'pendiente';
  }

  //Acciones comunes
  // Devuelve true si el usuario puede ver la historia clínica de ese turno
  puedeVerHistoriaClinica(turno: Turnos) {
    return (
      (this.rol === 'paciente' || this.rol === 'admin') &&
      turno.estado === 'finalizado'
    );
  }

  // Métodos de acción (ejemplo para cancelar)
  async cancelarTurno(turno: Turnos) {
    const motivo = await this.pedirComentario('Motivo de la cancelación');
    if (!motivo) return;
    await updateDoc(doc(this.firestore, 'turnos', turno.id), {
      estado: 'cancelado',
      comentarioCancelacion: motivo
    });
    this.snackBar.open('Turno cancelado', '', { 
      duration: 3500, 
      panelClass: ['success-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
    this.cargarTurnos();
  }

  async rechazarTurno(turno: Turnos) {
    const motivo = await this.pedirComentario('Motivo del rechazo');
    if (!motivo) return;
    await updateDoc(doc(this.firestore, 'turnos', turno.id), {
      estado: 'rechazado',
      comentarioRechazo: motivo
    });
    this.snackBar.open('Turno rechazado', '', { 
      duration: 3500, 
      panelClass: ['error-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
    this.cargarTurnos();
  }

  async aceptarTurno(turno: Turnos) {
    await updateDoc(doc(this.firestore, 'turnos', turno.id), {
      estado: 'aceptado'
    });
    this.snackBar.open('Turno aceptado', '', { 
      duration: 3500, 
      panelClass: ['success-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
    this.cargarTurnos();
  }

  async finalizarTurno(turno: Turnos) {
    const resena = await this.pedirComentario('Reseña');
    if (!resena) return;
    await updateDoc(doc(this.firestore, 'turnos', turno.id), {
      estado: 'realizado',
      resena
    });
    this.snackBar.open('Turno finalizado', '', { 
      duration: 3500, 
      panelClass: ['success-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
    this.cargarTurnos();
  }

  completarEncuesta(turno: any) {
    this.dialog.open(DialogoEncuesta, {
      width: '400px'
    }).afterClosed().subscribe(async result => {
      if (result) {
        try {
          const turnoRef = doc(this.firestore, 'turnos', turno.id);
          await updateDoc(turnoRef, {
            encuestaCompletada: true,
            encuesta: result
          });
          this.snackBar.open('¡Encuesta enviada!', '', { 
            duration: 3500, 
            panelClass: ['success-snackbar'], 
            verticalPosition: 'top', 
            horizontalPosition: 'center' 
          });
          this.cargarTurnos();
        } catch (e) {
          this.snackBar.open('Error al guardar la encuesta', '', { 
            duration: 3500, 
            panelClass: ['error-snackbar'], 
            verticalPosition: 'top', 
            horizontalPosition: 'center' 
          });
        }
      }
    });
  }

  async calificarAtencion(turno: Turnos) {
    const dialogRef = this.dialog.open(DialogoCalificacion, {
      data: { titulo: 'Calificar atención del especialista' }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (!result || !result.estrellas) return;
    await updateDoc(doc(this.firestore, 'turnos', turno.id), {
      calificacion: result.estrellas,
      comentarioCalificacion: result.comentario ?? ''
    });
    this.snackBar.open('Calificación guardada', '', { 
      duration: 3500, 
      panelClass: ['success-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
    this.cargarTurnos();
  }

  verResena(turno: Turnos) {
    this.dialog.open(DialogoComentario, {
      data: {
        titulo: 'Reseña del turno',
        comentario: turno.resena || 'Sin reseña',
        soloLectura: true
      }
    });
  }

  // Helper para pedir comentario (puedes reemplazarlo por un diálogo Material real)
  async pedirComentario(titulo: string): Promise<string | null> {
    const dialogRef = this.dialog.open(DialogoComentario, {
      data: { titulo, soloLectura: false }
    });
    const result = await dialogRef.afterClosed().toPromise();
    return result && result.trim() ? result : null;
  }

  async cargarHistoriaClinica(turno: Turnos) {
    const dialogRef = this.dialog.open(DialogoHistoriaClinica, {
      data: { paciente: { nombre: turno.pacienteNombre, uid: turno.pacienteUid } }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      const docRef = await addDoc(collection(this.firestore, 'historias-clinicas'), {
        ...result,
        pacienteUid: turno.pacienteUid,
        pacienteNombre: turno.pacienteNombre,
        especialistaUid: turno.especialistaUid,
        especialistaNombre: turno.especialistaNombre,
        especialidad: turno.especialidad,
        fecha: new Date().toISOString()
      });
      // Cambia el estado del turno a "finalizado"
      await updateDoc(doc(this.firestore, 'turnos', turno.id), {
        estado: 'finalizado',
        historiaClinicaId: docRef.id
      });
      this.snackBar.open('Historia clínica guardada', '', { 
        duration: 3500, 
        panelClass: ['success-snackbar'], 
        verticalPosition: 'top', 
        horizontalPosition: 'center' 
      });
      this.cargarTurnos();
    }
  }

  async verHistoriaClinica(turno: Turnos) {
    // Busca la historia clínica asociada a este turno
    if (!turno.historiaClinicaId) {
      this.snackBar.open('No hay historia clínica para este turno', '', { 
        duration: 3500, 
        panelClass: ['error-snackbar'], 
        verticalPosition: 'top', 
        horizontalPosition: 'center' 
      });
      return;
    }
    const ref = doc(this.firestore, 'historias-clinicas', turno.historiaClinicaId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      this.snackBar.open('No se encontró la historia clínica', '', { 
        duration: 3500, 
        panelClass: ['error-snackbar'], 
        verticalPosition: 'top', 
        horizontalPosition: 'center' 
      });
      return;
    }
    const historia = snap.data();

    // Abre el diálogo en modo solo lectura
    this.dialog.open(DialogoHistoriaClinica, {
      data: { paciente: { nombre: turno.pacienteNombre }, historia, soloLectura: true }
    });
  }
}

function fechasIguales(turnoFecha: string, historiaFecha: string): boolean {
  // turnoFecha y historiaFecha pueden ser "YYYY-MM-DD HH:mm" o ISO
  const tf = new Date(turnoFecha.replace(' ', 'T'));
  const hf = new Date(historiaFecha.replace(' ', 'T'));
  return (
    tf.getFullYear() === hf.getFullYear() &&
    tf.getMonth() === hf.getMonth() &&
    tf.getDate() === hf.getDate() &&
    tf.getHours() === hf.getHours() &&
    tf.getMinutes() === hf.getMinutes()
  );
}
