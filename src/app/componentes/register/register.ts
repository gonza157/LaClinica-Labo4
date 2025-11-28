import { AfterViewInit, Component, computed, ElementRef, inject, Signal, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule, Router } from '@angular/router';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification, User, getAuth } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Firestore, addDoc, collection, doc, getDocs, setDoc } from '@angular/fire/firestore';

import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../servicios/auth';
import { Resaltar } from '../../directivas/resaltar';
import { SoloNumeros } from '../../directivas/solo-numeros';
import { Autofoco } from '../../directivas/autofoco';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    MatProgressSpinnerModule,
    Resaltar,
    SoloNumeros,
    Autofoco
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements AfterViewInit {
  async validarCaptcha(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://us-central1-clinica-online-da668.cloudfunctions.net/verifyRecaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const result = await response.json();
      return result.success;
    } catch {
      return false;
    }
  }

  @ViewChild('captchaElem') captchaElem!: ElementRef;
  ngAfterViewInit() {
    // Espera a que el formulario esté visible
    setTimeout(() => {
      if ((window as any).grecaptcha && this.captchaElem) {
        (window as any).grecaptcha.render(this.captchaElem.nativeElement, {
          sitekey: '6Le1WxcsAAAAABw-YqhQfj_y2b0DHmIXJt_RP55Q'
        });
      }
    }, 0);
  }

  ngAfterViewChecked() {
    if ((window as any).grecaptcha && this.captchaElem) {
      if (!this.captchaElem.nativeElement.hasChildNodes()) {
        (window as any).grecaptcha.render(this.captchaElem.nativeElement, {
          sitekey: '6Le1WxcsAAAAABw-YqhQfj_y2b0DHmIXJt_RP55Q'
        });
      }
    }
  }

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  // Computed: ¿es admin?
  isAdmin = computed(() => this.authService.userSignal()?.rol === 'admin');

  public loading = false;

  fileName1: string = '';
  fileName2: string = '';

  tipoUsuario = signal<'paciente' | 'especialista' | 'admin' | null>(null);

  especialidades: string[] = [];

  mostrarOtraEspecialidad = false;

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: ['', [Validators.required, Validators.min(0)]],
    dni: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    obraSocial: [''], // solo para paciente
    especialidad: [[]], // array para múltiples especialidades
    imagen1: [null, Validators.required], // Volver a hacer obligatorio
    imagen2: [null],
  });

  nuevasEspecialidades: string = '';

  async ngOnInit() {
    await this.cargarEspecialidades();
  }

  async cargarEspecialidades() {
    const ref = collection(this.firestore, 'especialidades');
    const snap = await getDocs(ref);
    this.especialidades = snap.docs.map(d => d.data()['nombre']);
  }

  onTipoChange(tipo: 'paciente' | 'especialista' | 'admin') {
    this.tipoUsuario.set(tipo);
    if (tipo === 'especialista') {
      this.form.get('especialidad')?.setValidators([Validators.required]);
    } else {
      this.form.get('especialidad')?.clearValidators();
      this.form.get('especialidad')?.setValue([]);
    }
    this.form.get('especialidad')?.updateValueAndValidity();
  }

  onEspecialidadChange(values: string[]) {
    this.mostrarOtraEspecialidad = values.includes('otra');
    // Si se deselecciona "otra", limpiar el campo de nuevas especialidades
    if (!this.mostrarOtraEspecialidad) {
      this.nuevasEspecialidades = '';
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.loading) return;

    const captchaToken = (window as any).grecaptcha.getResponse();
    if (!captchaToken) {
      this.snackBar.open('Por favor, completa el captcha.', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar captcha en backend
    const captchaValido = await this.validarCaptcha(captchaToken);
    if (!captchaValido) {
      this.snackBar.open('Captcha inválido. Intenta de nuevo.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    //const { email, password } = this.form.value;
    const { email, password, nombre, apellido, edad, dni, obraSocial, especialidad, imagen1, imagen2 } = this.form.value;

    try {
      console.log('Intentando crear usuario con:', { email });
      // Usar siempre la instancia principal de auth para evitar conflictos
      const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCred.user;
      console.log('Usuario creado exitosamente:', user.uid);
      const uid = user.uid;
      if (!uid) throw new Error('No UID');

      const tipo = this.tipoUsuario();

      // SUBIR IMÁGENES
      const img1File = this.form.value.imagen1;
      const img2File = tipo === 'paciente' ? this.form.value.imagen2 : null;

      const upload = async (file: File, name: string): Promise<string> => {
        const path = `usuarios/${uid}/${name}-${uuidv4()}`;
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      };

      const img1Url = await upload(img1File, 'imagen1');
      const img2Url = img2File ? await upload(img2File, 'imagen2') : null;

      // 📌 ESPECIALIDADES
      let especialidadesSeleccionadas: string[] = [];

      if (tipo === 'especialista') {
        const seleccionadas: string[] = Array.isArray(this.form.value.especialidad)
          ? [...this.form.value.especialidad]
          : [];

        const incluyeOtra = seleccionadas.includes('otra');

        const nuevas = incluyeOtra && this.nuevasEspecialidades.trim()
          ? this.nuevasEspecialidades
            .split(',')
            .map((e: string) => e.trim())
            .filter((e: string) => e.length > 0)
          : [];

        especialidadesSeleccionadas = seleccionadas.filter((e: string) => e !== 'otra');
        especialidadesSeleccionadas.push(...nuevas);

        console.log('Especialidades seleccionadas:', especialidadesSeleccionadas);

        for (const esp of nuevas) {
          if (!this.especialidades.includes(esp)) {
            await addDoc(collection(this.firestore, 'especialidades'), { nombre: esp });
            this.especialidades.push(esp);
          }
        }
      }

      // 🔥 GUARDAR USUARIO EN FIRESTORE
      const data: any = {
        uid,
        nombre: this.form.value.nombre,
        apellido: this.form.value.apellido,
        edad: this.form.value.edad,
        dni: this.form.value.dni,
        email: this.form.value.email,
        rol: tipo,
        aprobado: tipo === 'especialista' ? false : true,
        obraSocial: tipo === 'paciente' ? this.form.value.obraSocial : null,
        especialidad: tipo === 'especialista' ? especialidadesSeleccionadas : null,
        imagen1: img1Url,
        imagen2: tipo === 'paciente' ? img2Url || null : null,
      };

      console.log('Datos a guardar en Firestore:', data);

      await setDoc(doc(this.firestore, 'usuarios', uid), data);

      await sendEmailVerification(user);

      // Mensaje de éxito personalizado según el tipo de usuario
      let mensajeExito = '';
      if (this.isAdmin()) {
        if (tipo === 'especialista') {
          mensajeExito = '🩺 Especialista creado exitosamente. Se envió email de verificación. El especialista debe ser aprobado por un administrador.';
        } else {
          mensajeExito = '👤 Paciente creado exitosamente. Se envió email de verificación.';
        }
      } else {
        if (tipo === 'especialista') {
          mensajeExito = '🩺 ¡Registro exitoso! Se envió email de verificación. Tu cuenta será revisada y aprobada por un administrador.';
        } else {
          mensajeExito = '👤 ¡Bienvenido a Clínica Iglesias! Se envió email de verificación. Por favor revisa tu correo.';
        }
      }

      this.snackBar.open(mensajeExito, '✓ Entendido', { 
        duration: 8500, // Medio segundo más (8.5 segundos total)
        panelClass: ['success-snackbar'],
        verticalPosition: 'top', // Posición superior
        horizontalPosition: 'center' // Centrado horizontalmente
      });

      if (!this.isAdmin()) {
        this.router.navigate(['/home']);
        window.scrollTo(0, 0);
      } else {
        this.router.navigate(['/admin/usuarios']);
        window.scrollTo(0, 0);
      }

    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // Mensajes descriptivos según el tipo de error
      let mensaje = 'Error inesperado en el registro.';
      
      if (err?.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            mensaje = 'El correo electrónico ya está registrado. Intenta con otro email o inicia sesión.';
            break;
          case 'auth/weak-password':
            mensaje = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
            break;
          case 'auth/invalid-email':
            mensaje = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/operation-not-allowed':
            mensaje = 'El registro con email/contraseña no está habilitado.';
            break;
          case 'permission-denied':
            mensaje = 'No tienes permisos para realizar esta operación.';
            break;
          default:
            mensaje = `Error en el registro: ${err.message}`;
        }
      } else if (err?.message) {
        mensaje = `Error: ${err.message}`;
      }
      
      this.snackBar.open(mensaje, 'Cerrar', { 
        duration: 5000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
    } finally {
      (window as any).grecaptcha.reset();
      this.loading = false;
    }
  }


  onFileChange(e: Event, field: 'imagen1' | 'imagen2') {
    const file = (e.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.form.get(field)?.setValue(file);
      if (field === 'imagen1') {
        this.fileName1 = file.name;
      } else if (field === 'imagen2') {
        this.fileName2 = file.name;
      }
    }
  }
}
