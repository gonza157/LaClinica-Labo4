import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from './environments/firebase';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function initializeFirestore() {
  console.log('🚀 Inicializando Firestore...');
  
  try {
    // Crear especialidades
    const especialidades = [
      'Cardiología',
      'Dermatología', 
      'Pediatría',
      'Neurología',
      'Traumatología',
      'Ginecología',
      'Oftalmología',
      'Psicología',
      'Medicina General',
      'Endocrinología'
    ];

    console.log('📋 Creando especialidades...');
    const especialidadesRef = collection(firestore, 'especialidades');
    
    for (const especialidad of especialidades) {
      await addDoc(especialidadesRef, { nombre: especialidad });
      console.log(`✅ Especialidad creada: ${especialidad}`);
    }

    // Crear un usuario administrador de ejemplo (opcional)
    console.log('👤 Creando datos de ejemplo...');
    
    console.log('🎉 ¡Firestore inicializado exitosamente!');
    console.log('📊 Colecciones creadas:');
    console.log('  - especialidades (10 documentos)');
    console.log('');
    console.log('📝 Las siguientes colecciones se crearán automáticamente:');
    console.log('  - usuarios (cuando se registren usuarios)');
    console.log('  - turnos (cuando se soliciten turnos)');
    console.log('  - logs-ingresos (para auditoría)');
    
  } catch (error) {
    console.error('❌ Error al inicializar Firestore:', error);
  }
}

// Ejecutar inicialización
initializeFirestore();