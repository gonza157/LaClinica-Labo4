import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';
import { firstValueFrom } from 'rxjs';

export const pacienteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const usuario = await firstValueFrom(auth.usuario$);

  if (usuario?.rol !== 'paciente') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};