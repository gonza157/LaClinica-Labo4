import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth';
import { Firestore, doc, updateDoc, getDoc, collection, getDocs, setDoc, query, where } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { DialogoHistorialClinicoPaciente } from '../dialogo-historial-clinico-paciente/dialogo-historial-clinico-paciente';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { DialogoSeleccionarEspecialista } from '../dialogo-seleccionar-especialista/dialogo-seleccionar-especialista';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule, CapitalizePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss'
})
export class MiPerfil implements OnInit {
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  user: any = null;
  especialidades: string[] = [];
  horarios: { [especialidad: string]: string[] } = {};

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horas = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '16:00', '16:30', '17:00', '17:30'];

  mostrarPrimeraImagen: boolean = true;

  alternarImagen() {
    this.mostrarPrimeraImagen = !this.mostrarPrimeraImagen;
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

  async ngOnInit() {
    this.user = this.authService.userSignal();
    if (this.user?.rol === 'especialista') {
      await this.cargarEspecialidades();
      await this.cargarHorarios();
    }
  }

  async cargarEspecialidades() {
    // Si el usuario tiene varias especialidades asociadas
    if (Array.isArray(this.user.especialidad)) {
      this.especialidades = this.user.especialidad;
    } else if (this.user.especialidad) {
      this.especialidades = [this.user.especialidad];
    } else {
      this.especialidades = [];
    }
  }

  async cargarHorarios() {
    // Trae los horarios guardados del especialista
    const ref = doc(this.firestore, 'usuarios', this.user.uid);
    const snap = await getDoc(ref);
    const data = snap.data();
    this.horarios = data?.['horarios'] || {};
  }

  toggleHorario(especialidad: string, dia: string, hora: string) {
    if (!this.horarios[especialidad]) this.horarios[especialidad] = [];
    const key = `${dia} ${hora}`;
    const idx = this.horarios[especialidad].indexOf(key);
    if (idx > -1) {
      this.horarios[especialidad].splice(idx, 1);
    } else {
      this.horarios[especialidad].push(key);
    }
  }

  tieneHorario(especialidad: string, dia: string, hora: string) {
    return this.horarios[especialidad]?.includes(`${dia} ${hora}`);
  }

  async guardarHorarios() {
    const ref = doc(this.firestore, 'usuarios', this.user.uid);
    await updateDoc(ref, { horarios: this.horarios });
    this.snackBar.open('Horarios actualizados correctamente', '', { 
      duration: 3500, 
      panelClass: ['success-snackbar'], 
      verticalPosition: 'top', 
      horizontalPosition: 'center' 
    });
  }

  verHistorialClinico() {
    this.dialog.open(DialogoHistorialClinicoPaciente, {
      width: '600px',
      data: {
        paciente: {
          uid: this.user.uid,
          nombre: this.user.nombre,
          apellido: this.user.apellido,
          rol: this.user.rol
        }
      }
    });
  }

  async descargarHistorialPDF() {
    // 1. Traer historias clínicas del paciente
    const ref = collection(this.firestore, 'historias-clinicas');
    const q = query(ref, where('pacienteUid', '==', this.user.uid));
    const snap = await getDocs(q);
    const historias = snap.docs
      .map(d => d.data())
      .sort((a, b) => new Date(b['fecha']).getTime() - new Date(a['fecha']).getTime());

    if (historias.length === 0) {
      this.snackBar.open('No hay historia clínica para descargar', 'Cerrar', { duration: 2000 });
      return;
    }

    // 2. Obtener especialistas únicos
    const especialistasUnicos = Array.from(new Set(historias.map(h => h['especialistaNombre'])));

    // 3. Mostrar diálogo de selección
    const dialogRef = this.dialog.open(DialogoSeleccionarEspecialista, {
      width: '350px',
      data: { especialistas: especialistasUnicos }
    });
    const especialistaElegido = await dialogRef.afterClosed().toPromise();

    if (especialistaElegido === undefined) return; // Cancelado

    const historiasFiltradas = especialistaElegido
      ? historias.filter(h => h['especialistaNombre'] === especialistaElegido)
      : historias;

    // 4. Traer turnos y reseñas asociados
    let turnos = [];
    let reseñas = [];
    if (especialistaElegido) {
      const turnosSnap = await getDocs(query(
        collection(this.firestore, 'turnos'),
        where('pacienteUid', '==', this.user.uid),
        where('especialistaNombre', '==', especialistaElegido)
      ));
      turnos = turnosSnap.docs.map(d => d.data());

      const reseñasSnap = await getDocs(query(
        collection(this.firestore, 'reseñas'),
        where('pacienteUid', '==', this.user.uid),
        where('especialistaNombre', '==', especialistaElegido)
      ));
      reseñas = reseñasSnap.docs.map(d => d.data());
    } else {
      // Si no se filtra, trae todos los turnos y reseñas del paciente
      const turnosSnap = await getDocs(query(
        collection(this.firestore, 'turnos'),
        where('pacienteUid', '==', this.user.uid)
      ));
      turnos = turnosSnap.docs.map(d => d.data());

      const reseñasSnap = await getDocs(query(
        collection(this.firestore, 'reseñas'),
        where('pacienteUid', '==', this.user.uid)
      ));
      reseñas = reseñasSnap.docs.map(d => d.data());
    }

    // 5. Crear PDF
    const doc = new jsPDF();

    // Logo
    const logoUrl = 'assets/favicon.ico';
    const img = new Image();
    img.src = logoUrl;

    // Espera a que cargue el logo antes de continuar
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 16, 16);

      // Título y fecha
      doc.setFontSize(18);
      doc.text('Historia Clínica', 30, 20);
      doc.setFontSize(11);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 30, 28);

      // Datos del paciente
      doc.setFontSize(12);
      doc.text(`Paciente: ${this.user.nombre} ${this.user.apellido}`, 14, 40);
      doc.text(`Email: ${this.user.email}`, 14, 47);
      doc.text(`Obra Social: ${this.user.obraSocial || '-'}`, 14, 54);

      // Tabla de historias clínicas
      autoTable(doc, {
        startY: 62,
        head: [[
          'Fecha', 'Especialista', 'Especialidad', 'Altura', 'Peso', 'Temp.', 'Presión', 'Datos adicionales'
        ]],
        body: historiasFiltradas.map(h => [
          h['fecha'] ? new Date(h['fecha']).toLocaleString() : '',
          h['especialistaNombre'] || '',
          h['especialidad'] || '',
          h['altura'] || '',
          h['peso'] || '',
          h['temperatura'] || '',
          h['presion'] || '',
          (h['dinamicos'] && h['dinamicos'].length)
            ? h['dinamicos'].map((d: any) => `${d.clave}: ${d.valor}`).join('\n')
            : ''
        ]),
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [25, 118, 210], // RGB azul #1976D2
          textColor: 255,            // Blanco
          fontStyle: 'bold'
        }
      });

      const nombreArchivo = `historia-clinica-${this.user.nombre}-${this.user.apellido}`.replace(/\s+/g, '_') + '.pdf';
      doc.save(nombreArchivo);
    };
  }
}