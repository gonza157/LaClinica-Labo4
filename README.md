# 🏥 Clínica Iglesias - Sistema de Gestión Médica Online

[![Angular](https://img.shields.io/badge/Angular-20.0.1-red)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

**🌐 Acceso a la aplicación:** [Clínica Iglesias Online](https://clinica-online-da668.web.app)

---

## 📋 ¿Qué es Clínica Iglesias?

Clínica Iglesias es una plataforma web integral diseñada para **gestionar turnos médicos, usuarios y atención de pacientes** de manera completamente digital. La aplicación facilita la interacción entre **pacientes, especialistas médicos y administradores**, optimizando la gestión de turnos y mejorando la comunicación en el ámbito sanitario.

### 🏢 Sobre nuestra clínica:
- **6 consultorios médicos** equipados
- **2 laboratorios físicos** en la clínica
- **Sala de espera general** cómoda y moderna
- **Horarios de atención:**
  - **Lunes a Viernes:** 8:00 a 19:00 hs
  - **Sábados:** 8:00 a 14:00 hs
- **Profesionales especializados** en diversas áreas médicas
- **Turnos mínimos de 30 minutos** (ajustables según especialidad)
- **Múltiples especialidades** por profesional
- **Administración centralizada** y eficiente

---

## 🎯 Funcionalidades Principales

### ✨ **Sistema de Usuarios**
- 🏥 **Pacientes:** Solicitud y gestión de turnos
- 👩‍⚕️ **Especialistas:** Manejo de consultas y horarios  
- 👨‍💼 **Administradores:** Control total del sistema

### 📅 **Gestión de Turnos**
- Solicitud online con disponibilidad en tiempo real
- Estados: Pendiente, Aceptado, Realizado, Cancelado, Rechazado, Finalizado
- Sistema de notificaciones por email
- Filtros avanzados y búsqueda

### 📋 **Historia Clínica**
- Registro detallado de consultas
- Datos fijos y dinámicos
- Acceso según permisos de usuario

### 🔐 **Seguridad**
- Autenticación con Firebase Auth
- Verificación de email obligatoria
- Validación con Captcha en registro
- Aprobación manual de especialistas

---

## 🖥️ Pantallas y Navegación

### 🏠 **1. Pantalla de Bienvenida**
![Pantalla Home - IMAGEN FALTANTE]()

**📍 Acceso:** Pantalla principal (`/home`)

**📝 Descripción:** 
- Presentación institucional de Clínica Iglesias
- Botones de acceso rápido a Login y Registro
- Información de contacto y horarios
- Diseño responsive y moderno

**🎮 Contenido:**
- Header con logo y navegación
- Hero section con llamada a la acción
- Cards informativos sobre servicios
- Footer con información de contacto

---

### 📝 **2. Sistema de Registro**
![Sistema de Registro - IMAGEN FALTANTE]()

**📍 Acceso:** 
- Botón "Registrarse" desde Home
- Sección Usuarios (solo Administradores)

**📝 Descripción:** Sistema completo de registro con diferentes tipos de usuario

#### 👤 **Registro de Paciente**
![Registro Paciente - IMAGEN FALTANTE]()

**📋 Campos requeridos:**
- Nombre y Apellido
- Edad y DNI  
- Obra Social
- Email y Contraseña
- **2 imágenes de perfil**
- Validación con Captcha

#### 👩‍⚕️ **Registro de Especialista**  
![Registro Especialista - IMAGEN FALTANTE]()

**📋 Campos requeridos:**
- Nombre y Apellido
- Edad y DNI
- **Especialidades** (selección múltiple + opción de agregar nueva)
- Email y Contraseña  
- **1 imagen de perfil**
- Validación con Captcha

#### 👨‍💼 **Registro de Administrador**
![Registro Admin - IMAGEN FALTANTE]()

**📋 Campos requeridos:** *(Solo accesible para Administradores)*
- Nombre y Apellido
- Edad y DNI
- Email y Contraseña
- **1 imagen de perfil**

---

### 🔑 **3. Sistema de Login**
![Sistema de Login - IMAGEN FALTANTE]()

**📍 Acceso:** Botón "Iniciar Sesión" desde Home

**📝 Descripción:** Autenticación segura con múltiples opciones

**🎮 Funcionalidades:**
- Login con email y contraseña
- **Botones de acceso rápido** con usuarios de prueba
- Validación de estado de cuenta:
  - **Pacientes:** Requieren verificación de email
  - **Especialistas:** Requieren verificación + aprobación de admin
- Redirección automática según rol
- Recuperación de contraseña

**👥 Usuarios de Acceso Rápido:**
![Botones Acceso Rápido - IMAGEN FALTANTE]()

---

## 🎭 **4. Paneles por Rol de Usuario**

### 🏥 **Panel de Paciente**
![Panel Paciente - IMAGEN FALTANTE]()

**📍 Acceso:** Automático tras login exitoso

#### 📅 **Solicitar Turno**
![Solicitar Turno Paciente - IMAGEN FALTANTE]()

**🎮 Proceso:**
1. **Selección de Especialidad**
2. **Selección de Especialista** (filtrado por especialidad)
3. **Selección de Fecha** (próximos 15 días)
4. **Selección de Horario** (según disponibilidad del especialista)
5. **Confirmación del turno**

**✨ Características:**
- Disponibilidad en tiempo real
- Sin uso de DatePicker (interfaz custom)
- Validación de horarios del especialista

#### 📋 **Mis Turnos**
![Mis Turnos Paciente - IMAGEN FALTANTE]()

**🔍 Filtros disponibles:**
- Por Especialidad
- Por Especialista  
- Búsqueda global sin combobox

**⚡ Acciones disponibles:**
- **Cancelar Turno** (si no fue realizado) + comentario obligatorio
- **Ver Reseña** (si el especialista dejó comentarios)
- **Completar Encuesta** (solo si el turno fue marcado como realizado)
- **Calificar Atención** (solo después de turno realizado)

#### 👤 **Mi Perfil**
![Mi Perfil Paciente - IMAGEN FALTANTE]()

**📊 Información mostrada:**
- Datos personales completos
- Imágenes de perfil (principal y secundaria)
- Historia clínica personal
- Opción de descarga de PDF de historia clínica

---

### 👩‍⚕️ **Panel de Especialista**
![Panel Especialista - IMAGEN FALTANTE]()

**📍 Acceso:** Automático tras login (requiere aprobación previa de admin)

#### 📋 **Mis Turnos**
![Mis Turnos Especialista - IMAGEN FALTANTE]()

**🔍 Filtros disponibles:**
- Por Especialidad
- Por Paciente
- Búsqueda global sin combobox

**⚡ Acciones disponibles según estado:**
- **Aceptar Turno** (turnos pendientes)
- **Rechazar Turno** + comentario obligatorio
- **Cancelar Turno** + comentario obligatorio
- **Finalizar Turno** + reseña/diagnóstico obligatorio
- **Cargar Historia Clínica** (al finalizar turno)
- **Ver Reseña** (turnos finalizados)

#### 👤 **Mi Perfil**
![Mi Perfil Especialista - IMAGEN FALTANTE]()

**📊 Información mostrada:**
- Datos personales completos
- Especialidades asignadas
- **Configuración de Horarios por Especialidad:**
  - Días de semana disponibles
  - Franjas horarias por día
  - Múltiples especialidades

#### 👥 **Sección Pacientes**
![Sección Pacientes Especialista - IMAGEN FALTANTE]()

**📝 Descripción:** Lista de pacientes atendidos al menos una vez
- Historia clínica de cada paciente
- Historial de consultas realizadas
- Datos médicos registrados

---

### 👨‍💼 **Panel de Administrador**
![Panel Administrador - IMAGEN FALTANTE]()

**📍 Acceso:** Automático tras login (usuario admin)

#### 📅 **Todos los Turnos**
![Todos los Turnos Admin - IMAGEN FALTANTE]()

**🔍 Filtros disponibles:**
- Por Especialidad
- Por Especialista
- Búsqueda global sin combobox

**⚡ Acciones disponibles:**
- **Cancelar Turno** + comentario obligatorio
- Vista completa de todos los turnos del sistema
- Supervisión del estado general

#### 📅 **Solicitar Turno (para Pacientes)**
![Solicitar Turno Admin - IMAGEN FALTANTE]()

**🎮 Proceso adicional:**
1. **Seleccionar Paciente** (paso extra para admin)
2. Selección de Especialidad
3. Selección de Especialista  
4. Selección de Fecha y Hora
5. Confirmación

#### 👥 **Gestión de Usuarios**
![Gestión de Usuarios - IMAGEN FALTANTE]()

**📋 Funcionalidades:**
- **Lista completa de usuarios** con datos y estado
- **Aprobación/Desaprobación de Especialistas**
- **Habilitación/Inhabilitación** de acceso al sistema  
- **Creación de nuevos usuarios** (Pacientes, Especialistas, Administradores)
- **Descarga de Excel** con datos de usuarios
- **Visualización de historias clínicas** de pacientes

#### 📊 **Informes y Estadísticas**
![Informes y Estadísticas - IMAGEN FALTANTE]()

**📈 Reportes disponibles:**
- Log de ingresos al sistema
- Cantidad de turnos por especialidad
- Cantidad de turnos por día
- Turnos solicitados por médico (por período)
- Turnos finalizados por médico (por período)
- Descarga en Excel y PDF

---

## 🎨 **Características de Diseño**

### 🌈 **Paleta de Colores**
- **Primario:** Azul (#1976d2) y Celeste (#42a5f5)
- **Secundario:** Gradientes azul-celeste
- **Estados:** Verde (éxito), Rojo (error), Amarillo (pendiente)

### ✨ **Animaciones y Transiciones**
- Transiciones suaves entre componentes
- Efectos hover en botones y cards
- Animaciones de carga y feedback visual
- Snackbars con posicionamiento centrado

### 📱 **Responsive Design**
- Adaptable a móviles, tablets y desktop
- Navegación optimizada para cada dispositivo
- Componentes flexibles y accesibles

---

## 🛠️ **Tecnologías Utilizadas**

### 🎯 **Frontend**
- **Angular 20.0.1** - Framework principal
- **TypeScript 5.8** - Lenguaje de programación
- **Angular Material** - Componentes UI
- **SCSS** - Estilos avanzados

### ☁️ **Backend & Hosting**
- **Firebase Authentication** - Gestión de usuarios
- **Firestore** - Base de datos NoSQL
- **Firebase Hosting** - Hosting web
- **Firebase Functions** - Servicios backend

### 🔧 **Librerías Adicionales**
- **jsPDF** - Generación de PDFs
- **ExcelJS** - Generación de archivos Excel
- **Angular Animations** - Animaciones
- **RxJS** - Programación reactiva

---

## 📥 **Instalación y Desarrollo**

### 📋 **Prerrequisitos**
```bash
Node.js >= 18.x.x
Angular CLI >= 20.x.x
Firebase CLI
```

### 🚀 **Instalación**
```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd clinica-online

# Instalar dependencias
npm install

# Configurar Firebase
npm install -g firebase-tools
firebase login
firebase init

# Servidor de desarrollo
ng serve
```

### 🏗️ **Build y Deploy**
```bash
# Build producción
ng build

# Deploy a Firebase
firebase deploy
```

---

## 👥 **Usuarios de Prueba**

### 🏥 **Pacientes**
```
📧 Email: paciente1@test.com
🔑 Password: 123456

📧 Email: paciente2@test.com  
🔑 Password: 123456
```

### 👩‍⚕️ **Especialistas**
```
📧 Email: especialista1@test.com
🔑 Password: 123456
🏷️ Especialidad: Cardiología

📧 Email: especialista2@test.com
🔑 Password: 123456  
🏷️ Especialidad: Dermatología
```

### 👨‍💼 **Administradores**
```
📧 Email: admin@test.com
🔑 Password: 123456
```

---



## 📞 **Contacto y Soporte**

**🏥 Clínica Iglesias**  
📧 Email: contacto@clinicaiglesias.com  
📱 Teléfono: +54 11 1234-5678  
🌐 Web: [https://clinica-online-da668.web.app](https://clinica-online-da668.web.app)

---

**Desarrollado con ❤️ usando Angular y Firebase**
