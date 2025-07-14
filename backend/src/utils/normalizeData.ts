import { Prioridade, StatusChamado } from '../types/milvus';

/**
 * Padroniza valores indicando ausência para a string "Não Possui".
 *
 * @param value Valor original do campo.
 * @returns Valor normalizado.
 */
export function normalizePossui(value: string | null): string {
    if (!value || value.toLowerCase() === 'não possui' || value.toLowerCase() === 'nao possui') {
        return 'Não Possui'; // Padroniza para formato com P maiúsculo
    }
    return value;
}


/**
 * Normaliza a prioridade dos chamados para valores padronizados.
 *
 * @param prioridade Texto da prioridade.
 * @returns Prioridade mapeada para o formato correto ou "Não Possui".
 */
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

/**
 * Converte os status retornados pelo Milvus para o idioma padrão do sistema.
 *
 * @param status Status original retornado pela API.
 * @returns Status normalizado em português.
 */
export function normalizeStatus(status: string | null): StatusChamado {
    if (!status) return 'Não Possui';
    
    return status
        .replace('Open', 'Aberto')
        .replace('In Progress', 'Em Andamento')
        .replace('Paused', 'Pausado')
        .replace('Resolved', 'Resolvido')
        .replace('Closed', 'Fechado') as StatusChamado;
}


/**
 * Garante que uma string esteja definida, retornando "Não Possui" quando vazia.
 *
 * @param value Valor recebido.
 * @returns Valor original ou o texto padrão.
 */
export function normalizeString(value: string | null): string {
    return value || 'Não Possui';
}