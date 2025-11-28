import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';
import { firstValueFrom, map } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await firstValueFrom(auth.firebaseUser$);

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};