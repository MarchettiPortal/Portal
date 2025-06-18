// src/services/slaRefresh.service.ts
import { pool } from '../../config/Global/db.config'
import { refreshCSVData } from '../../controllers/Milvus/Milvus.csvSLA.controller'
import { buscarUltimosChamados } from './API.Listagem.service'
import { ChamadoAPI, ChamadoBanco } from '../../types/chamado'
import {
  normalizePrioridade,
  normalizeStatus,
  normalizeString
} from '../../utils/normalizeData'

const MESAS_PERMITIDAS = [
  'Mesa Infraestrutura',
  'Mesa Infra - Pedidos de Compra'
]

/**
 * Busca API, busca DB, normaliza ambos, compara os campos
 * e chama refreshCSVData() na primeira diferença encontrada.
 */
export async function slaRefreshAutomatico(): Promise<{ refreshed: boolean; reason?: string }> {
  // 1) Pega os dados da API e normaliza
  const rawApi = await buscarUltimosChamados(1000)
  const apiMap = new Map<string, ChamadoAPI>()

  for (const c of rawApi) {
    //console.log(`Tipo do código da API (${c.codigo}):`, typeof c.codigo)  // Log tipo real da API

    const codigoStr = String(c.codigo)  // Converte para string

    apiMap.set(codigoStr, {
      codigo:       codigoStr,
      prioridade:   normalizePrioridade(c.prioridade),
      status:       normalizeStatus(c.status),
      mesa_trabalho: normalizeString(c.mesa_trabalho),
      tecnico:       normalizeString(c.tecnico)
    })
  }
  if (apiMap.size === 0) {
    return { refreshed: false, reason: 'API sem chamados.' }
  }

  // 2) Pega os dados do DB e normaliza
  const { rows: rawDb } = await pool.query<ChamadoBanco>(
    `
    SELECT codigo, prioridade, status, mesa_trabalho, nome_operador AS tecnico
      FROM chamados
     WHERE mesa_trabalho = ANY($1)
    `,
    [MESAS_PERMITIDAS]
  )
  
  const dbMap = new Map<string, ChamadoAPI>()
  for (const b of rawDb) {
    //console.log(`Tipo do código do banco (${b.codigo}):`, typeof b.codigo)  // Verificar tipo do banco
    const codigoStr = String(b.codigo)  // Garantir que o código seja tratado como string

    dbMap.set(codigoStr, {
      codigo: codigoStr,
      prioridade:   normalizePrioridade(b.prioridade),
      status:       normalizeStatus(b.status),
      mesa_trabalho: normalizeString(b.mesa_trabalho),
      tecnico:       normalizeString(b.tecnico)
    })
  }

  // 3) Compare: para cada chamado da API, veja no DB
  for (const [codigo, apiCh] of apiMap) {
    const dbCh = dbMap.get(codigo)
    // Novo chamado?
    if (!dbCh) {
      const reason = `Chamado ${codigo} não existia no DB`
      //console.log('🔁 Refresh executado. Motivo:', reason)
      await refreshCSVData()
      return { refreshed: true, reason: `Chamado ${codigo} não existia no DB.` }
    }
    // Compare campo a campo
    if (apiCh.prioridade !== dbCh.prioridade) {
      const reason = `prioridade diferente no ${codigo}`
      //console.log('🔁 Refresh executado. Motivo:', reason)
      await refreshCSVData()
      return { refreshed: true, reason }
    }
    if (apiCh.status !== dbCh.status) {
      const reason = `status diferente no ${codigo}`
      //console.log('🔁 Refresh executado. Motivo:', reason)
      await refreshCSVData()
      return { refreshed: true, reason }
    }
    if (apiCh.mesa_trabalho !== dbCh.mesa_trabalho) {
      const reason = `mesa_trabalho diferente no ${codigo}`
      //console.log('🔁 Refresh executado. Motivo:', reason)
      await refreshCSVData()
      return { refreshed: true, reason }
    }
    if (apiCh.tecnico !== dbCh.tecnico) {
      const reason = `tecnico diferente no ${codigo}`
      //console.log('🔁 Refresh executado. Motivo:', reason)
      await refreshCSVData()
            return { refreshed: true, reason }
}

    
  }

  // 4) Se chegou aqui, não achou diferença
  //console.log('✅ Nenhuma mudança detectada no SLA.')
  return { refreshed: false }
}
