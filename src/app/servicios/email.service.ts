import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  async enviarEmailAprobacion(especialista: any): Promise<boolean> {
    try {
      const url = 'https://us-central1-clinica-online-da668.cloudfunctions.net/enviarEmailAprobacion';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: especialista.email,
          nombre: especialista.nombre,
          apellido: especialista.apellido
        })
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        console.error('Error en el servidor:', result.error);
        return false;
      }
    } catch (error: any) {
      console.error('Error enviando email:', error);
      return false;
    }
  }
}