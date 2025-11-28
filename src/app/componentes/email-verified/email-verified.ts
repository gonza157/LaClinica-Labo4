import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth, applyActionCode } from '@angular/fire/auth';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="verification-container">
      <div class="verification-card">
        
        <!-- Estado de carga -->
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="60"></mat-spinner>
          <h2>Verificando tu email...</h2>
          <p>Por favor espera un momento</p>
        </div>

        <!-- Estado de éxito -->
        <div *ngIf="!loading && success" class="success-state">
          <div class="success-icon">
            <div class="checkmark">✓</div>
          </div>
          <div class="clinic-title">
            <h1>🏥 Clínica Iglesias</h1>
            <p class="subtitle">Sistema de Gestión Médica Online</p>
          </div>
          <div class="content">
            <h2>¡Email verificado exitosamente!</h2>
            <p class="message">
              Tu dirección de correo electrónico ha sido verificada correctamente. 
              Ya puedes iniciar sesión con tu cuenta.
            </p>
            <div class="actions">
              <button mat-raised-button color="primary" class="login-btn" (click)="goToLogin()">
                <mat-icon>login</mat-icon>
                Iniciar Sesión
              </button>
              <button mat-button class="home-btn" (click)="goToHome()">
                Ir al Inicio
              </button>
            </div>
          </div>
          <div class="footer">
            <p>"Cuidamos tu salud con pasión y excelencia"</p>
          </div>
        </div>

        <!-- Estado de error -->
        <div *ngIf="!loading && !success" class="error-state">
          <div class="error-icon">
            <div class="cross">✗</div>
          </div>
          <div class="clinic-title">
            <h1>🏥 Clínica Iglesias</h1>
            <p class="subtitle">Sistema de Gestión Médica Online</p>
          </div>
          <div class="content">
            <h2>Error en la verificación</h2>
            <p class="message">
              {{ errorMessage }}
            </p>
            <div class="actions">
              <button mat-raised-button color="primary" class="login-btn" (click)="goToHome()">
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      font-family: 'Segoe UI', Arial, sans-serif;
    }

    .verification-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
      animation: slideIn 0.6s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-icon {
      margin-bottom: 30px;
    }

    .checkmark {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
      font-size: 40px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: bounce 0.8s ease-out;
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    .clinic-title h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
      font-style: italic;
    }

    .content h2 {
      color: #333;
      font-size: 28px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .message {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .login-btn {
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white !important;
      padding: 12px 30px !important;
      border-radius: 25px !important;
      font-weight: bold !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
      transition: all 0.3s ease !important;
    }

    .login-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }

    .home-btn {
      color: #667eea !important;
      border: 2px solid #667eea !important;
      padding: 10px 25px !important;
      border-radius: 25px !important;
    }

    .home-btn:hover {
      background-color: #667eea !important;
      color: white !important;
    }

    .footer {
      border-top: 1px solid #eee;
      padding-top: 20px;
      color: #999;
      font-style: italic;
      font-size: 14px;
    }

    .error-icon {
      margin-bottom: 30px;
    }

    .cross {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f44336, #e57373);
      color: white;
      font-size: 40px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: shake 0.6s ease-out;
      box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .loading-state {
      text-align: center;
      padding: 40px;
    }

    .loading-state h2 {
      color: #333;
      margin: 20px 0 10px;
    }

    .loading-state p {
      color: #666;
    }

    .success-state, .error-state {
      /* Estilos existentes se mantienen */
    }

    @media (max-width: 600px) {
      .verification-card {
        padding: 30px 20px;
      }
      
      .clinic-title h1 {
        font-size: 28px;
      }
      
      .actions {
        flex-direction: column;
      }
      
      .login-btn, .home-btn {
        width: 100%;
      }
    }
  `]
})
export class EmailVerifiedComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);

  loading = true;
  success = false;
  errorMessage = '';

  async ngOnInit() {
    await this.processEmailVerification();
  }

  async processEmailVerification() {
    try {
      // Obtener el código de verificación de la URL
      const actionCode = this.route.snapshot.queryParams['oobCode'];
      
      if (!actionCode) {
        throw new Error('Código de verificación no encontrado en la URL.');
      }

      // Aplicar el código de verificación
      await applyActionCode(this.auth, actionCode);
      
      this.success = true;
      this.loading = false;
      
    } catch (error: any) {
      this.loading = false;
      this.success = false;
      
      // Mensajes de error más amigables
      switch (error?.code) {
        case 'auth/expired-action-code':
          this.errorMessage = 'El enlace de verificación ha expirado. Por favor, solicita un nuevo enlace de verificación.';
          break;
        case 'auth/invalid-action-code':
          this.errorMessage = 'El enlace de verificación no es válido. Verifica que hayas copiado correctamente la URL.';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
          break;
        default:
          this.errorMessage = 'Ocurrió un error al verificar tu email. Por favor, intenta nuevamente o contacta al soporte.';
      }
      
      console.error('Error en verificación de email:', error);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}