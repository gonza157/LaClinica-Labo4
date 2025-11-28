export interface HistoriaClinica {
    id?: string;
    pacienteUid: string;
    pacienteNombre: string;
    especialistaUid: string;
    especialistaNombre: string;
    fecha: string; // ISO string
    altura: number;
    peso: number;
    temperatura: number;
    presion: string;
    dinamicos: { clave: string; valor: string }[];
}
