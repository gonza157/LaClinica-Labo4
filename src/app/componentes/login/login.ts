import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, signInWithEmailAndPassword, signOut, User, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc,  collection, addDoc } from '@angular/fire/firestore';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private afAuth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // NUEVO: Usuarios de acceso rápido
  quickUsers = [
    {
      nombre: 'Paciente 1',
      email: 'g.iglesiasalonzo@gmail.com',
      password: '123456',
      imagen: 'assets/paciente1.jpg'
    },
    {
      nombre: 'Paciente 2',
      email: 'gesovo7900@gamepec.com',
      password: '123456',
      imagen: 'assets/paciente2.png'
    },
    {
      nombre: 'Paciente 3',
      email: 'dmi6mgydk2@zudpck.com',
      password: '123456',
      imagen: 'assets/paciente3.png'
    },
    {
      nombre: 'Especialista 1',
      email: 'ahea5ofcu2@daouse.com',
      password: '123456',
      imagen: 'assets/especialista1.jpg'
    },
    {
      nombre: 'Especialista 2',
      email: 'tocobi1190@bipochub.com',
      password: '123456',
      imagen: 'assets/especialista2.png'
    },
    {
      nombre: 'Administrador',
      email: 'giselle.skipor@gmail.com',
      password: '123456',
      imagen: 'assets/Administrador.png'
    }
  ];

  // NUEVO: Método para autocompletar desde botón rápido
  selectQuickUser(user: any) {
    this.form.get('email')?.setValue(user.email);
    this.form.get('password')?.setValue(user.password);
  }

  tipoSeleccionado: 'paciente' | 'especialista' | 'admin' | null = null;

  /*
  autofill(tipo: 'paciente' | 'especialista' | 'admin') {
    this.tipoSeleccionado = tipo;
    let email = '';
    let password = '';
    switch (tipo) {
      case 'paciente':
        email = 'samisaavedra96@hotmail.com';
        password = 'samisaav';
        break;
      case 'especialista':
        email = 'cynteran27@gmail.com';
        password = '123456';
        break;
      case 'admin':
        email = 'samisaavedra96@gmail.com';
        password = 'samisaav';
        break;
    }
    this.form.get('email')?.setValue(email);
    this.form.get('password')?.setValue(password);
  }
    */

  async login() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const { email, password } = this.form.value;

    try {
      const cred = await signInWithEmailAndPassword(this.afAuth, email!, password!);
      const user = cred.user;

      if (!user) throw new Error('Usuario no encontrado');

      await user.reload();

      if (!user.emailVerified) {
        await this.afAuth.signOut();
        this.snackBar.open(
          '📧 Email no verificado. Por favor, revisa tu correo y haz clic en el enlace de verificación para activar tu cuenta.', 
          '✓ Entendido', 
          { 
            duration: 7000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          }
        );
        this.loading = false;
        return;
      }

      // Esperar un poco antes de acceder a Firestore
      await new Promise(resolve => setTimeout(resolve, 300));

      // Obtener info adicional desde Firestore
      const userRef = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        this.snackBar.open(
          '❌ No se encontraron datos adicionales del usuario. Contacta al administrador.', 
          '✓ Entendido', 
          { 
            duration: 6000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          }
        );
        this.loading = false;
        return;
      }

      const data = userSnap.data() as any;
      const rol = data.rol;
      const aprobado = data.aprobado;

      if (rol === 'especialista' && !aprobado) {
        await this.afAuth.signOut();
        this.snackBar.open(
          '⏳ Tu cuenta de especialista aún no ha sido aprobada por un administrador. Te notificaremos cuando esté lista.', 
          '✓ Entendido', 
          { 
            duration: 8000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          }
        );
        this.loading = false;
        return;
      }

      // Esperar a que Firebase Auth emita el usuario actualizado
      await firstValueFrom(authState(this.afAuth));

      // Ya están listas las señales, ahora sí navegar
      this.snackBar.open(
        '🎉 ¡Bienvenido/a a Clínica Iglesias! Login exitoso.', 
        '✓ Continuar', 
        { 
          duration: 3000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center'
        }
      );

      // Si el login es exitoso, guardamos el log de ingreso
      await addDoc(collection(this.firestore, 'logs-ingresos'), {
        usuario: email,
        fecha: new Date().toISOString()
      });

      // Redireccionar según rol
      if (rol === 'paciente') {
        this.router.navigate(['/paciente']);
        window.scrollTo(0, 0);
      } else if (rol === 'especialista') {
        this.router.navigate(['/especialista']);
        window.scrollTo(0, 0);
      } else if (rol === 'admin') {
        this.router.navigate(['/admin']);
        window.scrollTo(0, 0);
      } else {
        this.router.navigate(['/']); // fallback
        window.scrollTo(0, 0);
      }

    } catch (err) {
      console.error(err);
      this.snackBar.open(
        '❌ Error en el login. Verifica tus credenciales e intenta nuevamente.', 
        '✓ Entendido', 
        { 
          duration: 5000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center'
        }
      );
    } finally {
      this.loading = false;
    }
  }
}