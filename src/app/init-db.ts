import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-init-db',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Inicializar Base de Datos</h2>
      <button (click)="inicializarDB()" [disabled]="loading">
        {{ loading ? 'Creando...' : 'Crear Colecciones' }}
      </button>
      <div *ngIf="mensaje">{{ mensaje }}</div>
    </div>
  `
})
export class InitDB {
  private firestore = inject(Firestore);
  loading = false;
  mensaje = '';

  async inicializarDB() {
    this.loading = true;
    this.mensaje = 'Creando especialidades...';

    try {
      // Crear especialidades
      const especialidades = [
        'Cardiología',
        'Dermatología', 
        'Pediatría',
        'Neurología',
        'Traumatología',
        'Ginecología',
        'Oftalmología',
        'Psicología',
        'Medicina General',
        'Psiquiatría'
      ];

      for (const esp of especialidades) {
        await addDoc(collection(this.firestore, 'especialidades'), { 
          nombre: esp 
        });
      }

      this.mensaje = '✅ Base de datos inicializada correctamente!';
      console.log('✅ Especialidades creadas exitosamente');
      
    } catch (error) {
      this.mensaje = '❌ Error al crear las colecciones';
      console.error('Error:', error);
    }
    
    this.loading = false;
  }
}