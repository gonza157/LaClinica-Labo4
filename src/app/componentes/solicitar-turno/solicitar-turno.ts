import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, FormsModule, CommonModule, MatOptionModule],
  templateUrl: './solicitar-turno.html',
  styleUrl: './solicitar-turno.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('3000ms ease', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class SolicitarTurno implements OnInit {
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);

  especialidades: any[] = []; // Cambia a array de objetos para tener nombre e imagen
  especialidadesDelEspecialista: any[] = []; // Especialidades del especialista seleccionado
  especialistas: any[] = [];
  pacientes: any[] = [];
  especialistasFiltrados: any[] = [];

  selectedEspecialidad: string = '';
  selectedEspecialista: any = null;
  selectedPaciente: any = null; // Solo para admin
  selectedFecha: string = '';
  selectedHora: string = '';

  diasSemana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  horariosOcupadosPorDia: { [fecha: string]: string[] } = {};

  user: any = null;
  rol: string = '';

  // Declaramos como propiedad para usar desde varias funciones y HTML
  dias15: { fecha: string; dia: string; horas: string[] }[] = [];

  // Función para obtener horarios disponibles en una fecha
  getHorariosParaFecha: (fecha: string) => string[] = () => [];

  fechasDisponibles: string[] = [];

  formatearHoraAMPM(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    // Formatea la hora con dos dígitos y AM/PM
    const horaStr = date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    // Elimina el cero del mediodía si lo deseas, o déjalo así para siempre 2 dígitos
    return horaStr;
  }

  // Utilidad para verificar si la imagen existe en assets
  existeImagen(ruta: string): boolean {
    // Como no puedes verificar archivos locales en Angular, simplemente asume que existe si el nombre coincide con tus archivos
    // Si quieres ser más estricto, puedes mantener un array con los nombres válidos
    const imagenesDisponibles = [
      'especialidad-Cardiólogo infantil.png',
      'especialidad-Dermatólogo.png',
      'especialidad-Ginecólogo.png',
      'especialidad-Médico Clínico.png',
      'especialidad-Obstétra.png',
      'especialidad-Pediatra.png'
    ];
    return imagenesDisponibles.some(img => ruta.endsWith(img));
  }

  async ngOnInit() {
    this.user = this.authService.userSignal();
    this.rol = this.user?.rol;

    await this.cargarEspecialidades();
    await this.cargarEspecialistas();

    if (this.rol === 'admin') {
      this.pacientes = await this.cargarPacientes();
    }
  }

  estaFechaCompleta(fecha: string): boolean {
    const horarios = this.getHorariosParaFecha(fecha);
    const ocupados = this.horariosOcupadosPorDia[fecha] || [];
    return horarios.length > 0 && horarios.every(hora => ocupados.includes(hora));
  }

  async cargarEspecialidades() {
    try {
      // Puedes obtenerlas de una colección
      const ref = collection(this.firestore, 'especialidades');
      const especialidadesSnapshot = await getDocs(ref);
      console.log('📋 Especialidades encontradas:', especialidadesSnapshot.size);
      
      this.especialidades = especialidadesSnapshot.docs.map(d => {
        const data = d.data();
        console.log('Especialidad:', data);
        // Busca la imagen en assets por nombre, si no existe usa la default
        const nombre = data['nombre'];
        // Ejemplo: especialidad-Cardiólogo infantil.png
        const nombreArchivo = `assets/especialidad-${nombre}.png`;
        // Puedes mejorar esto si tienes extensiones .jpg también
        // Si no existe la imagen, usa la default
        return {
          ...data,
          imagen: this.existeImagen(nombreArchivo)
            ? nombreArchivo
            : 'assets/especialidad-default.png'
        };
      });
      
      console.log('📋 Especialidades procesadas:', this.especialidades);
    } catch (error) {
      console.error('Error cargando especialidades:', error);
      this.snackBar.open('Error al cargar especialidades', 'Cerrar', { duration: 3000 });
    }
  }

  especialistaTieneEspecialidad(esp: any, especialidad: string): boolean {
    if (!especialidad) return false;
    if (Array.isArray(esp.especialidad)) {
      return esp.especialidad.includes(especialidad);
    }
    return esp.especialidad === especialidad;
  }

  async cargarEspecialistas() {
    try {
      const ref = collection(this.firestore, 'usuarios');
      const q = query(ref, where('rol', '==', 'especialista'));
      const snap = await getDocs(q);
      
      this.especialistas = snap.docs.map(d => {
        const data = d.data();
        return { uid: d.id, ...data };
      });
      
      // Filtra solo los especialistas aprobados
      this.especialistasFiltrados = this.especialistas.filter(e => {
        const aprobado = e['aprobado'];
        return aprobado === true || aprobado === 'true' || aprobado === 1;
      });
      
      // Si no hay especialistas aprobados, mostrar mensaje
      if (this.especialistasFiltrados.length === 0) {
        this.snackBar.open('No hay especialistas aprobados disponibles', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error cargando especialistas:', error);
      this.snackBar.open('Error al cargar especialistas', 'Cerrar', { duration: 3000 });
    }
  }

  async cargarPacientes() {
    try {
      const ref = collection(this.firestore, 'usuarios');
      const q = query(ref, where('rol', '==', 'paciente'));
      const snap = await getDocs(q);
      
      return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      return [];
    }
  }

  async onEspecialidadChange() {
    // Filtra especialistas por especialidad seleccionada
    this.selectedFecha = '';
    this.selectedHora = '';
    this.fechasDisponibles = [];
    this.dias15 = [];
    this.horariosOcupadosPorDia = {};

    // Obtiene las especialidades del especialista seleccionado
    if (this.selectedEspecialista) {
      const especialidadesIds = Array.isArray(this.selectedEspecialista.especialidad)
        ? this.selectedEspecialista.especialidad
        : [this.selectedEspecialista.especialidad];
      this.especialidadesDelEspecialista = this.especialidades.filter(e =>
        especialidadesIds.includes(e.nombre)
      );
    } else {
      this.especialidadesDelEspecialista = [];
    }

    if (!this.selectedEspecialista || !this.selectedEspecialidad) {
      return;
    }

    // 1. Leer los horarios del especialista según la especialidad seleccionada
    const especialistaRef = doc(this.firestore, 'usuarios', this.selectedEspecialista.uid);
    const especialistaSnap = await getDoc(especialistaRef);

    if (!especialistaSnap.exists()) {
      this.snackBar.open('No se encontró el especialista en Firebase.', 'Cerrar', { duration: 2000 });
      return;
    }

    const data = especialistaSnap.data();
    const horarios: string[] = data?.['horarios']?.[this.selectedEspecialidad] || [];

    if (!horarios.length) {
      this.snackBar.open('⚠️ Este especialista aún no ha configurado horarios para esta especialidad. Selecciona otro especialista o especialidad.', '✓ Entendido', { 
        duration: 6500, 
        panelClass: ['error-snackbar'],
        verticalPosition: 'top', 
        horizontalPosition: 'center' 
      });
      return;
    }

    // 2. Calcular los próximos 15 días con horarios disponibles
    const hoy = new Date();
    this.dias15 = [];

    for (let i = 0; i < 15; i++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() + i);
      const nombreDia = this.diasSemana[d.getDay()];
      const fechaISO = d.toISOString().slice(0, 10); // yyyy-MM-dd

      const horariosDeEseDia = horarios
        .filter(h => h.startsWith(nombreDia))
        .map(h => h.split(' ')[1]); // extrae la hora

      if (horariosDeEseDia.length > 0) {
        this.dias15.push({ fecha: fechaISO, dia: nombreDia, horas: horariosDeEseDia });
        this.horariosOcupadosPorDia[fechaISO] = []; // Inicializa ocupados
      }
    }

    this.fechasDisponibles = this.dias15.map(d => d.fecha);

    // 3. Leer los turnos ya ocupados de ese especialista
    const ref = collection(this.firestore, 'turnos');
    const snap = await getDocs(query(ref, where('especialistaUid', '==', this.selectedEspecialista.uid)));

    snap.docs.forEach(doc => {
      const turno = doc.data();
      // Solo marcar como ocupado si el estado NO es cancelado ni rechazado
      if (turno['estado'] === 'cancelado' || turno['estado'] === 'rechazado') return;
      const [fecha, hora] = turno['fecha'].split(' ');
      if (this.horariosOcupadosPorDia[fecha]) {
        this.horariosOcupadosPorDia[fecha].push(hora);
      }
    });

    // 4. Función auxiliar para obtener horarios disponibles por fecha
    this.getHorariosParaFecha = (fecha: string) => {
      const horas = this.dias15.find(d => d.fecha === fecha)?.horas || [];
      // Ordena las horas de menor a mayor
      return horas.slice().sort((a, b) => {
        // Convierte "HH:mm" a minutos para comparar
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });
    };
  }

  async onEspecialistaChange() {
    this.selectedEspecialidad = '';
    this.selectedFecha = '';
    this.selectedHora = '';
    this.fechasDisponibles = [];
    this.dias15 = [];
    this.horariosOcupadosPorDia = {};

    if (this.selectedEspecialista) {
      const especialidadesIds = Array.isArray(this.selectedEspecialista.especialidad)
        ? this.selectedEspecialista.especialidad
        : [this.selectedEspecialista.especialidad];
      this.especialidadesDelEspecialista = this.especialidades.filter(e =>
        especialidadesIds.includes(e.nombre)
      );
    } else {
      this.especialidadesDelEspecialista = [];
    }
  }

  onFechaChange() {
    // Aquí podrías filtrar horarios según la fecha y la disponibilidad real
    this.selectedHora = '';
  }

  async solicitarTurno() {
    if (!this.selectedEspecialidad || !this.selectedEspecialista || !this.selectedFecha || !this.selectedHora) {
      this.snackBar.open('Completa todos los campos', 'Cerrar', { duration: 2000 });
      return;
    }
    const paciente = this.rol === 'admin' ? this.selectedPaciente : this.user;
    if (!paciente) {
      this.snackBar.open('Selecciona un paciente', 'Cerrar', { duration: 2000 });
      return;
    }

    // VALIDACIÓN: ¿Ya existe un turno ese día para este paciente y especialista?
    const ref = collection(this.firestore, 'turnos');
    const q = query(
      ref,
      where('pacienteUid', '==', paciente.uid),
      where('especialistaUid', '==', this.selectedEspecialista.uid)
    );
    const snap = await getDocs(q);
    const mismoDia = snap.docs.find(doc => {
      const fechaTurno = doc.data()['fecha']?.split(' ')[0];
      return fechaTurno === this.selectedFecha;
    });
    if (mismoDia) {
      this.snackBar.open('Ya tienes un turno con este especialista para ese día.', 'Cerrar', { duration: 2500 });
      return;
    }

    // Aquí deberías validar que el turno no esté ocupado

    await addDoc(collection(this.firestore, 'turnos'), {
      pacienteUid: paciente.uid,
      pacienteNombre: paciente.nombre + ' ' + paciente.apellido,
      especialistaUid: this.selectedEspecialista.uid,
      especialistaNombre: this.selectedEspecialista.nombre + ' ' + this.selectedEspecialista.apellido,
      especialidad: this.selectedEspecialidad,
      fecha: this.selectedFecha + ' ' + this.selectedHora,
      estado: 'pendiente'
    });

    this.snackBar.open('🩺 Turno solicitado correctamente. Te notificaremos cuando el especialista lo confirme.', '✓ Entendido', { 
      duration: 6500, 
      panelClass: ['success-snackbar'],
      verticalPosition: 'top', 
      horizontalPosition: 'center'
    });
    // Limpia selección
    this.selectedEspecialidad = '';
    this.selectedEspecialista = null;
    this.selectedPaciente = null;
    this.selectedFecha = '';
    this.selectedHora = '';
    this.fechasDisponibles = [];
    this.dias15 = [];
    this.horariosOcupadosPorDia = {};
  }
}
