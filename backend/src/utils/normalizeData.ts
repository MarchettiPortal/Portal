import { Prioridade, StatusChamado } from '../types/milvus';


export function normalizePossui(value: string | null): string {
    if (!value || value.toLowerCase() === 'não possui' || value.toLowerCase() === 'nao possui') {
        return 'Não Possui'; // Padroniza para formato com P maiúsculo
    }
    return value;
}

export function normalizePrioridade(prioridade: string | null): string {
    if (!prioridade || prioridade.toLowerCase() === 'não possui' || prioridade.toLowerCase() === 'nao possui') {
        return 'Não Possui';
    }
    
    return prioridade
        .replace(/medio/gi, 'Médio')
        .replace(/medium/gi, 'Médio')
        .replace(/baixa/gi, 'Baixo')
        .replace(/high/gi, 'Alto')
        .replace(/critico/gi, 'Crítico');
}

export function normalizeStatus(status: string | null): StatusChamado {
    if (!status) return 'Não Possui';
    
    return status
        .replace('Open', 'Aberto')
        .replace('In Progress', 'Em Andamento')
        .replace('Paused', 'Pausado')
        .replace('Resolved', 'Resolvido')
        .replace('Closed', 'Fechado') as StatusChamado;
}

export function normalizeString(value: string | null): string {
    return value || 'Não Possui';
}