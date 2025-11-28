import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip, ArcElement, PieController, DoughnutController } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ArcElement, PieController, DoughnutController)

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './informes.html',
  styleUrl: './informes.scss'
})
export class Informes implements OnInit {
  logs: any[] = [];
  turnos: any[] = [];
  turnosPorEspecialidad: any = {};
  turnosPorDia: any = {};
  turnosPorMedico: any = {};
  turnosFinalizadosPorMedico: any = {};
  fechaDesde: string = '';
  fechaHasta: string = '';

  constructor(private firestore: Firestore) { }

  async ngOnInit() {
    // Cargar logs de ingresos
    const logsSnap = await getDocs(collection(this.firestore, 'logs-ingresos'));
    this.logs = logsSnap.docs.map(d => d.data());

    // Ordenar logs por fecha ascendente
    this.logs.sort((b, a) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Cargar turnos
    const turnosSnap = await getDocs(collection(this.firestore, 'turnos'));
    this.turnos = turnosSnap.docs.map(d => d.data());

    // Procesar estadísticas
    this.procesarEstadisticas();
  }

  procesarEstadisticas() {
    let turnosFiltrados = this.turnos;

    // Filtrado por rango de fechas solo para informes por médico
    if (this.fechaDesde || this.fechaHasta) {
      turnosFiltrados = turnosFiltrados.filter(t => {
        const fechaTurno = t.fecha.split(' ')[0];
        if (this.fechaDesde && fechaTurno < this.fechaDesde) return false;
        if (this.fechaHasta && fechaTurno > this.fechaHasta) return false;
        return true;
      });
    }

    // Por especialidad
    this.turnosPorEspecialidad = {};
    this.turnos.forEach(t => {
      this.turnosPorEspecialidad[t.especialidad] = (this.turnosPorEspecialidad[t.especialidad] || 0) + 1;
    });

    // Por día
    this.turnosPorDia = {};
    this.turnos.forEach(t => {
      const dia = t.fecha.split(' ')[0];
      this.turnosPorDia[dia] = (this.turnosPorDia[dia] || 0) + 1;
    });

    // Por médico (solicitados y finalizados) - SOLO filtrados por fecha
    this.turnosPorMedico = {};
    this.turnosFinalizadosPorMedico = {};
    turnosFiltrados.forEach(t => {
      const medico = t.especialistaNombre;
      this.turnosPorMedico[medico] = (this.turnosPorMedico[medico] || 0) + 1;
      if (t.estado === 'finalizado') {
        this.turnosFinalizadosPorMedico[medico] = (this.turnosFinalizadosPorMedico[medico] || 0) + 1;
      }
    });
  }

  descargarExcel() {
    const workbook = new ExcelJS.Workbook();

    // ===== 1. Turnos por Especialidad =====
    const hojaEspecialidad = workbook.addWorksheet('Turnos por Especialidad');
    const datosEspecialidad = Object.entries(this.turnosPorEspecialidad).map(([especialidad, cantidad]) => ({
      Especialidad: especialidad,
      Cantidad: cantidad
    }));
    hojaEspecialidad.columns = [
      { header: 'Especialidad', key: 'Especialidad', width: 20 },
      { header: 'Cantidad', key: 'Cantidad', width: 10 }
    ];
    hojaEspecialidad.addRows(datosEspecialidad);

    // ===== 2. Turnos por Día =====
    const hojaDias = workbook.addWorksheet('Turnos por Día');
    const datosDias = Object.entries(this.turnosPorDia).map(([dia, cantidad]) => ({
      Día: dia,
      Cantidad: cantidad
    }));
    hojaDias.columns = [
      { header: 'Día', key: 'Día', width: 20 },
      { header: 'Cantidad', key: 'Cantidad', width: 10 }
    ];
    hojaDias.addRows(datosDias);

    // ===== 3. Turnos por Médico =====
    const hojaMedicos = workbook.addWorksheet('Turnos por Médico');
    const datosMedicos = Object.entries(this.turnosPorMedico).map(([medico, solicitados]) => ({
      Médico: medico,
      Solicitados: solicitados,
      Finalizados: this.turnosFinalizadosPorMedico[medico] || 0
    }));
    hojaMedicos.columns = [
      { header: 'Médico', key: 'Médico', width: 25 },
      { header: 'Solicitados', key: 'Solicitados', width: 12 },
      { header: 'Finalizados', key: 'Finalizados', width: 12 }
    ];
    hojaMedicos.addRows(datosMedicos);

    // ===== 4. Log de Ingresos =====
    const hojaLogs = workbook.addWorksheet('Log de Ingresos');
    const datosLogs = this.logs.map(log => ({
      Usuario: log.usuario,
      Fecha: new Date(log.fecha).toLocaleString()
    }));
    hojaLogs.columns = [
      { header: 'Usuario', key: 'Usuario', width: 25 },
      { header: 'Fecha', key: 'Fecha', width: 25 }
    ];
    hojaLogs.addRows(datosLogs);

    // ===== Aplicar estilos a todas las hojas =====
    [hojaEspecialidad, hojaDias, hojaMedicos, hojaLogs].forEach(hoja => {
      const headerRow = hoja.getRow(1);
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1976D2' }
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

      hoja.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.eachCell(cell => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      hoja.columns?.forEach((col, i) => {
        let maxLength = col.header?.toString().length || 10;
        hoja.eachRow(row => {
          const val = row.getCell(i + 1).value?.toString() || '';
          maxLength = Math.max(maxLength, val.length + 2);
        });
        col.width = maxLength;
      });
    });

    // ===== Descargar el archivo =====
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'informe-turnos.xlsx');
    });
  }


  descargarPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Especialidad', 'Cantidad']],
      body: Object.entries(this.turnosPorEspecialidad)
        .map(([especialidad, cantidad]) => [especialidad as string, String(cantidad)]),
      headStyles: {
        fillColor: [25, 118, 210], // RGB azul #1976D2
        textColor: 255,            // Blanco
        fontStyle: 'bold'
      }
    });

    // Selecciona el canvas de la sección correspondiente
    const secciones = document.querySelectorAll('.informe-section');
    const seccionEspecialidad = secciones[1]; // 0: log, 1: especialidad
    const canvas = seccionEspecialidad ? seccionEspecialidad.querySelector('canvas') : null;

    if (canvas) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 60;
      doc.addImage(imgData, 'PNG', 15, y, 180, 80);
    }

    doc.save('turnos-por-especialidad.pdf');
  }

  // Métodos para exponer keys/values a la vista
  get especialidades(): string[] {
    return Object.keys(this.turnosPorEspecialidad);
  }
  get cantidadesEspecialidad(): number[] {
    return Object.values(this.turnosPorEspecialidad);
  }
  get dias(): string[] {
    return Object.keys(this.turnosPorDia);
  }
  get medicos(): string[] {
    return Object.keys(this.turnosPorMedico);
  }

  // Datos del gráfico actualizados en tiempo real
  public barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // En lugar de esta definición fija, creamos un getter para que se actualice:
  get barChartData() {
    return {
      labels: Object.keys(this.turnosPorEspecialidad),
      datasets: [
        {
          data: Object.values(this.turnosPorEspecialidad),
          label: 'Cantidad',
          backgroundColor: '#1976d2'
        }
      ]
    };
  }

  descargarPDFPorDia() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Día', 'Cantidad']],
      body: Object.entries(this.turnosPorDia)
        .map(([dia, cantidad]) => [dia, String(cantidad)]),
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' }
    });

    // Selecciona el canvas de la sección correspondiente (la tercera sección)
    const secciones = document.querySelectorAll('.informe-section');
    const seccionDias = secciones[2]; // 0: log, 1: especialidad, 2: días
    const canvas = seccionDias ? seccionDias.querySelector('canvas') : null;

    if (canvas) {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 60;
      doc.addImage(imgData, 'PNG', 15, y, 180, 80);
    }

    doc.save('turnos-por-dia.pdf');
  }

  descargarPDFPorMedico() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Médico', 'Solicitados', 'Finalizados']],
      body: Object.keys(this.turnosPorMedico).map(medico => [
        medico,
        String(this.turnosPorMedico[medico]),
        String(this.turnosFinalizadosPorMedico[medico] || 0)
      ]),
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' }
    });

    // 2. Selecciona los canvas de la sección de médicos
    // Busca solo los canvas dentro de la última sección de informe-section
    const secciones = document.querySelectorAll('.informe-section');
    const seccionMedicos = secciones[secciones.length - 1];
    const canvases = seccionMedicos ? seccionMedicos.querySelectorAll('canvas') : [];

    let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 60;

    canvases.forEach((canvas: any, i: number) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      if (i > 0) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Gráfico de ${this.pieChartDataMedicos[i]?.nombre || 'Médico'}`, 15, y);
      doc.addImage(imgData, 'PNG', 15, y + 10, 180, 80);
    });

    doc.save('turnos-por-medico.pdf');
  }

  descargarPDFLog() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Usuario', 'Fecha y Hora']],
      body: this.logs.map(log => [
        log.usuario,
        new Date(log.fecha).toLocaleString()
      ]),
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' }
    });
    doc.save('log-ingresos.pdf');
  }

  get barChartDataDias() {
    return {
      labels: Object.keys(this.turnosPorDia),
      datasets: [
        {
          data: Object.values(this.turnosPorDia),
          label: 'Cantidad',
          backgroundColor: '#1976d2'
        }
      ]
    };
  }

  public barChartOptionsDias = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { title: { display: true, text: 'Día' } },
      y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true }
    }
  };

  /*get barChartDataMedicos() {
    return {
      labels: Object.keys(this.turnosPorMedico),
      datasets: [
        {
          data: Object.values(this.turnosPorMedico),
          label: 'Solicitados',
          backgroundColor: '#1976d2'
        },
        {
          data: Object.keys(this.turnosPorMedico).map(
            medico => this.turnosFinalizadosPorMedico[medico] || 0
          ),
          label: 'Finalizados',
          backgroundColor: '#1976d2'
        }
      ]
    };
  }

  public barChartOptionsMedicos = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' as const }
    },
    scales: {
      x: { title: { display: true, text: 'Médico' } },
      y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true }
    }
  };*/

  get pieChartDataMedicos() {
    return Object.keys(this.turnosPorMedico).map(medico => {
      const total = this.turnosPorMedico[medico] || 0;
      const finalizados = this.turnosFinalizadosPorMedico[medico] || 0;
      const pendientes = total - finalizados;
      return {
        nombre: medico,
        data: {
          labels: ['Pendientes', 'Finalizados'],
          datasets: [{
            data: [pendientes, finalizados],
            backgroundColor: ['#64B5F6', '#1976d2']
          }]
        }
      };
    });
  }

  public pieChartOptionsMedicos = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' as const }
    }
  };
}
