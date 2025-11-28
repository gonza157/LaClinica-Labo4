export interface Turnos {
    id: string;
    pacienteUid: string;
    pacienteNombre: string;
    especialistaUid: string;
    especialistaNombre: string;
    especialidad: string;
    fecha: string; // o Date
    estado: 'pendiente' | 'aceptado' | 'realizado' | 'cancelado' | 'rechazado' | 'finalizado';
    comentarioCancelacion?: string;
    resena?: string;
    encuestaCompletada?: boolean;
    calificacion?: string;
    historiaClinica?: any;
    historiaClinicaId?: string;
}
