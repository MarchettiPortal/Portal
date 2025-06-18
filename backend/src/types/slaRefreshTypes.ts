import { MudancaDetectada } from './common';

export interface SLARefreshStatus {
    enabled: boolean;
    lastUpdate: Date | null;
    nextUpdate: Date | null;
    mode: 'business' | 'after-hours';
}