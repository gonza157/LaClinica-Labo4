import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { RegisterComponent } from './componentes/register/register';
import { LoginComponent } from './componentes/login/login';
import { Admin } from './componentes/usuarios/admin/admin';
import { authGuard } from './guard/auth-guard';
import { verificadoGuard } from './guard/verificado-guard';
import { adminGuard } from './guard/admin-guard';
import { Especialista } from './componentes/usuarios/especialista/especialista';
import { Paciente } from './componentes/usuarios/paciente/paciente';
import { pacienteGuard } from './guard/paciente-guard';
import { especialistaGuard } from './guard/especialista-guard';
import { InitDB } from './init-db';
import { EmailVerifiedComponent } from './componentes/email-verified/email-verified';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'init-db', component: InitDB }, // ⚡ Ruta temporal para inicializar DB
    { path: 'email-verified', component: EmailVerifiedComponent },
    { path: 'home', component: Home },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },

    { path: 'admin', component: Admin, canActivate: [authGuard, verificadoGuard, adminGuard] },
    { path: 'especialista', component: Especialista, canActivate: [authGuard, verificadoGuard, especialistaGuard] },
    { path: 'paciente', component: Paciente, canActivate: [authGuard, verificadoGuard, pacienteGuard] },

    { path: 'mi-perfil', loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil), canActivate: [authGuard, verificadoGuard] },
    { path: 'turnos', loadComponent: () => import('./componentes/mis-turnos/mis-turnos').then(m => m.MisTurnos), canActivate: [authGuard, verificadoGuard] },
    { path: 'solicitar-turno', loadComponent: () => import('./componentes/solicitar-turno/solicitar-turno').then(m => m.SolicitarTurno), canActivate: [authGuard, verificadoGuard] },
    { path: 'admin/usuarios', loadComponent: () => import('./componentes/admin-usuarios/admin-usuarios').then(m => m.AdminUsuarios), canActivate: [authGuard, verificadoGuard, adminGuard] },
    { path: 'admin/informes', loadComponent: () => import('./componentes/informes/informes').then(m => m.Informes), canActivate: [authGuard, verificadoGuard, adminGuard] },
    { path: 'especialista/pacientes', loadComponent: () => import('./componentes/pacientes-atendidos/pacientes-atendidos').then(m => m.PacientesAtendidos), canActivate: [authGuard, verificadoGuard, especialistaGuard] },
];