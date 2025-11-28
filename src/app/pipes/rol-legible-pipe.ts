import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rolLegible',
  standalone: true
})
export class RolLegiblePipe implements PipeTransform {

  transform(rol: string): string {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'especialista': return 'Especialista';
      case 'paciente': return 'Paciente';
      default: return rol;
    }
  }

}
