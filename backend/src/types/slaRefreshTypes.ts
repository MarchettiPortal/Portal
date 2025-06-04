// types/slaRefreshTypes.ts
export interface MudancaDetectada {
    codigo: string; // Garantindo que será sempre string
    campo: string;
    valorAnterior: string;
    valorNovo: string;
}

export interface SLARefreshStatus {
    enabled: boolean;
    lastUpdate: Date | null;
    nextUpdate: Date | null;
    mode: 'business' | 'after-hours';
}