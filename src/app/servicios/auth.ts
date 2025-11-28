import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, User, authState, signOut } from '@angular/fire/auth';
import { DocumentReference, Firestore, doc, docData } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, Observable, map } from 'rxjs';

export interface Usuario {
  uid: string;
  email: string;
  emailVerified: boolean;
  rol: 'admin' | 'especialista' | 'paciente';
  aprobado?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Guarda el usuario de Firebase Auth
  public firebaseUser$ = authState(this.auth);

  public usuario$: Observable<Usuario | null> = authState(this.auth).pipe(
    switchMap((user): Observable<Usuario | null> => {
      if (user?.uid) {
        const ref = doc(this.firestore, 'usuarios', user.uid) as DocumentReference<Usuario>;
        return docData<Usuario>(ref, { idField: 'uid' }).pipe(
          map((data) => data ?? null)
        );
      } else {
        return of(null);
      }
    })
  );

  userSignal = toSignal(this.usuario$, { initialValue: null });
  firebaseUserSignal = toSignal(this.firebaseUser$, { initialValue: null });

  isAuthenticated = computed(() => !!this.userSignal());
  isVerified = computed(() => this.firebaseUserSignal()?.emailVerified ?? false);
  isAdmin = computed(() => this.userSignal()?.rol === 'admin');
  isEspecialistaAprobado = computed(() =>
    this.userSignal()?.rol === 'especialista' && this.userSignal()?.aprobado
  );
  isPaciente = computed(() => this.userSignal()?.rol === 'paciente');

  logout() {
    return signOut(this.auth);
  }
}
