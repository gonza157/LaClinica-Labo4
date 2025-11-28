import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { collectionData, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogoHistorialClinicoPaciente } from '../dialogo-historial-clinico-paciente/dialogo-historial-clinico-paciente';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';
import { DniFormatPipe } from '../../pipes/dni-format-pipe';
import { RolLegiblePipe } from '../../pipes/rol-legible-pipe';
import { EmailService } from '../../servicios/email.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResaltarHoverDirective } from '../../directivas/resaltar-hover.directive';
import { ConfirmarAccionDirective } from '../../directivas/confirmar-accion.directive';

@Component({
  selector: 'app-admin-usuarios',
  imports: [CommonModule, MatTableModule, MatButtonModule, RouterLink, MatIconModule, CapitalizePipe, DniFormatPipe, RolLegiblePipe, ResaltarHoverDirective, ConfirmarAccionDirective],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios {
  private firestore = inject(Firestore);
  private dialog = inject(MatDialog);
  private emailService = inject(EmailService);
  private snackBar = inject(MatSnackBar);

  usuarios$: Observable<any[]> = collectionData(
    collection(this.firestore, 'usuarios'),
    { idField: 'uid' }
  ) as Observable<any[]>;

  async cambiarEstadoEspecialista(uid: string, aprobado: boolean) {
    try {
      // Actualizar estado en Firestore
      const ref = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(ref, { aprobado });

      // Si se está aprobando (aprobado = true), enviar email
      if (aprobado) {
        // Obtener datos del especialista
        const usuarios = await firstValueFrom(this.usuarios$);
        const especialista = usuarios.find(u => u.uid === uid);
        
        if (especialista && especialista.email) {
          this.snackBar.open('Enviando email de notificación...', '✓ Entendido', { duration: 2500, panelClass: ['success-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' });
          
          const emailEnviado = await this.emailService.enviarEmailAprobacion(especialista);
          
          if (emailEnviado) {
            this.snackBar.open(
              `Especialista aprobado y email enviado a ${especialista.email}`, 
              '✓ Entendido', 
              { duration: 6500, panelClass: ['success-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' }
            );
          } else {
            this.snackBar.open(
              `Especialista aprobado, pero falló el envío del email a ${especialista.email}`, 
              '✓ Entendido', 
              { duration: 6500, panelClass: ['error-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' }
            );
          }
        } else {
          this.snackBar.open('Especialista aprobado', '✓ Entendido', { duration: 6500, panelClass: ['success-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' });
        }
      } else {
        this.snackBar.open('Especialista desaprobado', '✓ Entendido', { duration: 4500, panelClass: ['error-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' });
      }
      
    } catch (error) {
      console.error('Error al cambiar estado del especialista:', error);
      this.snackBar.open('Error al cambiar el estado del especialista', '✓ Entendido', { duration: 6500, panelClass: ['error-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' });
    }
  }

  verHistorialClinico(user: any) {
    this.dialog.open(DialogoHistorialClinicoPaciente, {
      width: '600px',
      data: {
        paciente: {
          uid: user.uid,
          nombre: user.nombre,
          apellido: user.apellido
        }
      }
    });
  }

  async descargarExcel() {
    // Obtiene los usuarios actuales
    const usuarios = await firstValueFrom(this.usuarios$);

    // Prepara los datos (puedes filtrar/ordenar campos si lo deseas)
    const datos = usuarios.map(u => ({
      Nombre: u.nombre,
      Apellido: u.apellido,
      Email: u.email,
      Rol: u.rol,
      Especialidad: Array.isArray(u.especialidad) ? u.especialidad.join(', ') : (u.especialidad || ''),
      ObraSocial: u.obraSocial || '',
      Aprobado: u.aprobado !== undefined ? (u.aprobado ? 'Sí' : 'No') : '',
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    // Agrega los encabezados
    worksheet.columns = Object.keys(datos[0]).map(key => ({
      header: key,
      key: key,
      width: 20
    })) as ExcelJS.Column[];

    // Estilo de encabezado
    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1976D2' } // azul consistente con el tema
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agrega los datos
    datos.forEach(dato => {
      const row = worksheet.addRow(dato);
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    // Ajuste automático de ancho de columnas (recorriendo filas)
    worksheet.columns.forEach((col, index) => {
      let maxLength = col.header ? col.header.toString().length : 10;
      worksheet.eachRow(row => {
        const cell = row.getCell(index + 1); // +1 porque las columnas comienzan en 1
        const val = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, val.length + 2);
      });

      col.width = maxLength;
    });

    // Genera el archivo y lo descarga
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Usuarios.xlsx');
  }

  async toggleFavorito(user: any) {
    const ref = doc(this.firestore, `usuarios/${user.uid}`);
    await updateDoc(ref, { favorito: !user.favorito });
  }

  async descargarTurnosPDF(user: any) {
    // Determina el campo a buscar según el rol
    const esPaciente = user.rol === 'paciente';
    const campo = esPaciente ? 'pacienteUid' : 'especialistaUid';

    // Trae los turnos del usuario
    const turnosSnap = await getDocs(query(
      collection(this.firestore, 'turnos'),
      where(campo, '==', user.uid)
    ));
    let turnos = turnosSnap.docs.map(d => d.data());

    // Ordena los turnos por fecha descendente (más reciente primero)
    turnos = turnos.sort((a, b) => new Date(b['fecha']).getTime() - new Date(a['fecha']).getTime());

    if (turnos.length === 0) {
      this.snackBar.open('No hay turnos para este usuario', '', { 
        duration: 4000, 
        panelClass: ['error-snackbar'], 
        verticalPosition: 'top', 
        horizontalPosition: 'center' 
      });
      return;
    }

    // Prepara los datos para la tabla
    const body = turnos.map(t => [
      t['fecha'] ? new Date(t['fecha']).toLocaleString() : '',
      t['especialidad'] || '',
      t['especialistaNombre'] || '',
      t['pacienteNombre'] || '',
      t['estado'] || '',
      t['comentarioCancelacion'] || '',
      t['resena'] || ''
    ]);

    // Define los encabezados según el rol
    const head = esPaciente
      ? [['Fecha', 'Especialidad', 'Especialista', 'Paciente', 'Estado', 'Comentario', 'Reseña']]
      : [['Fecha', 'Especialidad', 'Especialista', 'Paciente', 'Estado', 'Comentario', 'Reseña']];

    // Crea el PDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Turnos de ' + user.nombre + ' ' + user.apellido, 14, 18);

    autoTable(doc, {
      startY: 24,
      head,
      body,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [25, 118, 210], // RGB azul #1976D2
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    doc.save(`Turnos-${user.nombre}-${user.apellido}.pdf`);
  }
}
