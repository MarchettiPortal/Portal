import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import csvParser from 'csv-parser'
import { pipeline } from 'stream/promises'
import { parse, format, getYear, differenceInMilliseconds } from 'date-fns'
import { pt } from 'date-fns/locale'
import { upsertTicket } from './csvSLA.DB.service';
import  dotenvConfig  from '../../config/Milvus/dotenv.milvus.config'
import { normalizePrioridade, normalizeStatus, normalizeString, normalizePossui  } from '../../utils/normalizeData';
import { ParsedRow } from '../../types/milvus'
import { logger } from '../../utils/logger'



/**
 * Processa o CSV e depois insere no Banco de Dados.
 * Each row is normalized and persisted using {@link upsertTicket}.
 */
export async function processCSV(): Promise<void> {
  const csvPath = path.resolve(__dirname, dotenvConfig.PATH_CSV_SLA)

  try {
    await pipeline(
      createReadStream(csvPath, { encoding: 'utf-8' }),
      csvParser({ separator: ';' }),
      async function* (source) {
        for await (const rawRow of source) {
          try {
            const row = manipulateData(rawRow)
            await upsertTicket(row)
          } catch (err) {
            logger.error('Erro ao processar linha:', rawRow, err)
          }
        }
      }
    )
    //logger.log('Processamento do CSV concluído!')
  } catch (err) {
    logger.error('Falha no pipeline de CSV:', err)
    throw err
  }finally {
  }
}

/**
 * Aplica as regras de normatização para as linhas do CSV antes da insersão no banco.
 * 
 * @param row Linha bruta obtida do CSV.
 * @returns Linha normalizada pronta para o banco de dados.
 */
export function manipulateData(row: any) {

    // --- 1. Substituir valores antigos na coluna "CATEGORIA" pelos valores novos utilizados atualmente
  const catMap: Record<string,string> = {
        "05 - Rede / Internet / 01 - Wifi": "Rede e Internet / Wifi",
        "05 - Rede / Internet / 02 - Permissão / Acesso": "Rede e Internet / Permissão-Acesso",
        "05 - Rede / Internet / 03 - Internet": "Rede e Internet / Internet",
        "05 - Rede / Internet / 04 - Instalação de Rede": "Rede e Internet / Instalação Rede",
        "05 - Rede / Internet / 05 - Nova Conexão": "Rede e Internet / Nova Conexão",
        "05 - Rede / Internet / 06 - Office365 / E-mail": "Rede e Internet / Office365",
        "05 - Rede / Internet / 07 - Antivírus": "Rede e Internet / Antivírus",
        "05 - Rede / Internet" : "Rede e Internet / Internet",
        "05 - Rede / Internet / 06 - Antivírus": "Rede e Internet / Antivírus",
        "05 - Rede / Internet / Internet": "Rede e Internet / Internet",
        "05 - Rede / Internet /  Internet": "Rede e Internet / Internet",
        "04 - Equipamentos / 03 - Impressoras": "Equipamentos / Impressoras",
        "04 - Equipamentos / 02 - Configuração de dispositivo": "Equipamentos / Outros-Equipamentos",
        "04 - Equipamentos / 2 - Configuração de dispositivo": "Equipamentos / Outros-Equipamentos",        
        "04 - Equipamentos / 04 - Celular": "Equipamentos / Celulares",
        "04 - Equipamentos / 3 - Novo Dispositivo": "Equipamentos / Outros-Equipamentos",
        "04 - Equipamentos / 01 - Computador/Notebook": "Equipamentos / Computador-Notebook",
        "04 - Equipamentos / 01 - Computadores/Notebook": "Equipamentos / Computador-Notebook",
        "04 - Equipamentos / 02 - Impressoras": "Equipamentos / Impressoras",
        "04 - Equipamentos / 03 - Tablet": "Equipamentos / Tablet",
        "04 - Equipamentos / 04 - Celulares": "Equipamentos / Celulares",
        "04 - Equipamentos / 05 - Camera": "Equipamentos / Camera",
        "04 - Equipamentos / 06 - Servidor": "Equipamentos / Servidor",
        "04 - Equipamentos / 07 - Instalação Programa": "Equipamentos / Instalação Programa",
        "04 - Equipamentos / 08 - Telefonia": "Equipamentos / Telefonia",
        "04 - Equipamentos / 09 - Outros Equipamentos": "Equipamentos / Outros-Equipamentos",
        "04 - Equipamentos / 10 - Formatação Computador/Notebook": "Equipamentos / Formatação",
        "04 - Equipamentos / 10 - Formatação de Computador/Notebook": "Equipamentos / Formatação"
    };
    if (catMap[row.CATEGORIA]) row.CATEGORIA = catMap[row.CATEGORIA]
    if (row.CATEGORIA?.includes('/')) {
        const [cat, sub] = row.CATEGORIA.split('/').map(s => s.trim())
        row.CATEGORIA = cat
        row.SUBCATEGORIA = sub
    }


    // --- 2. Preencher a coluna "LOCAL" com base nos valores da coluna "SETOR" 
  const setorMap: Record<string,string> = {
        "Acabamento  - Molas": 'Indústria',
        "Almoxarifado ": 'Indústria',
        "Comercial - Nacional": 'Atacadista/Matriz',
        "Compras": 'Indústria',
        "Contábil": "Atacadista/Matriz",
        "Custos": "Atacadista/Matriz",
        "Diretoria": "Atacadista/Matriz",
        "Engenharia de Processo": 'Indústria',
        "Engenharia de Produto": 'Indústria',
        "Engenharia Industrial": 'Indústria',
        "Estoque - Molas ": 'Indústria',
        "Expedição - Indústria": 'Indústria',
        "Expedição Atacadista": 'Indústria',
        "Exportação":"Atacadista/Matriz",
        "Feixes": 'Indústria',
        "Financeiro":"Atacadista/Matriz",
        "Fiscal": "Atacadista/Matriz",
        "Gerência": 'Indústria',
        "Manutenção - Mecânica": 'Indústria',
        "Manutenção Elétrica": 'Indústria',
        "Marketing": "Atacadista/Matriz",
        "PPCP": 'Indústria',
        "Produção - Grampos": 'Indústria',
        "Produção - Molas": 'Indústria',
        "Projetos": 'Indústria',
        "Qualidade": 'Indústria',
        "Recepção": "Atacadista/Matriz",
        "Recursos Humanos": 'Indústria',
        "Segurança do Trabalho - SST": 'Indústria',
        "Suprimentos": 'Indústria',
        "TI - Infraestrutura": 'Indústria',
        "TI - Sistemas": 'Indústria',
        "Tratamento Térmico": 'Indústria',
        "Televendas": 'Atacadista/Matriz'
    };
    if (!row.LOCAL && setorMap[row.SETOR]) row.LOCAL = setorMap[row.SETOR]
    

    // --- 3. Conversão dos dados de DATA e HORA de Criação e Solução dos tickets, aplicando os valores em variáveis utilizadas no SQL para implementação no banco de dados // Cálculo de SLA
    try {
        // Se não tem solução, marca data/hora atual e aberto
        if (row.DATA_SOLUCAO === 'Não possui') {
        const now = new Date()
        row.DATA_SOLUCAO = format(now, 'dd/MM/yyyy')
        row.HORA_SOLUCAO = format(now, 'HH:mm:ss')
        row.TICKETS_ABERTOS = 'Aberto'
        } else {
        row.TICKETS_ABERTOS = 'Finalizado'
        }
        const dtCri = parse(row.DATA_CRIACAO, 'dd/MM/yyyy', new Date())
        const hrCri = parse(row.HORA_CRIACAO, 'HH:mm:ss', new Date())
        const dtSol = parse(row.DATA_SOLUCAO, 'dd/MM/yyyy', new Date())
        const hrSol = parse(row.HORA_SOLUCAO, 'HH:mm:ss', new Date())

        row.DATA_CRIACAO_SQL = format(dtCri, 'yyyy-MM-dd')
        row.MES_CRIACAO_SQL = format(dtCri, 'LLLL', { locale: pt }).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        row.ANO_CRIACAO_SQL  = getYear(dtCri)
        row.HORA_CRIACAO_SQL = format(hrCri, 'HH:mm:ss')

        row.DATA_SOLUCAO_SQL = format(dtSol, 'yyyy-MM-dd')
        row.MES_SOLUCAO_SQL = format(dtSol, 'LLLL', { locale: pt }).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        row.ANO_SOLUCAO_SQL  = getYear(dtSol)
        row.HORA_SOLUCAO_SQL = format(hrSol, 'HH:mm:ss')

        const diffMs = differenceInMilliseconds(
        new Date(dtSol.getFullYear(), dtSol.getMonth(), dtSol.getDate(), hrSol.getHours(), hrSol.getMinutes(), hrSol.getSeconds()),
        new Date(dtCri.getFullYear(), dtCri.getMonth(), dtCri.getDate(), hrCri.getHours(), hrCri.getMinutes(), hrCri.getSeconds())
        )
        row.SLA = (diffMs / 3_600_000).toFixed(2)
    } catch (err) {
        logger.error('Erro ao processar datas/SLA:', err)
    }
        


    // --- 4. Substituir NOME DO OPERADOR para fins estéticos
  const opMap: Record<string,string> = {
        "Rafael ": "Rafael Gretter",
        "Engenharia de Produto": "Rafael Gretter",
        "Infraestrutura": "Guilherme Klug",
        "Guilherme": "Guilherme Klug",
        "Não possui": "Não Possui"
        
    }
    if (opMap[row.NOME_OPERADOR]) row.NOME_OPERADOR = opMap[row.NOME_OPERADOR]
    if (row.NOTA_AVALIACAO === 'Não possui') row.NOTA_AVALIACAO = null
    


    // --- 5. Remover valores "Não Possui" da coluna NOTA_AVALIACAO e transformar em NULL
    row.PRIORIDADE      = normalizePrioridade(row.PRIORIDADE)
    row.STATUS          = normalizeStatus(row.STATUS)
    row.MESA_TRABALHO   = normalizeString(row.MESA_TRABALHO)
    row.TECNICO         = normalizeString(row.TECNICO)
    row.NOME_OPERADOR   = normalizeString(row.NOME_OPERADOR)
    row.LOCAL           = normalizePossui(row.LOCAL)
    row.SETOR           = normalizePossui(row.SETOR)

  // --- 6. Substituir Atendimento para fins estéticos
  const comprasMap: Record<string,string> = {
        "'Solicitação/Pedido de Compras'": "Pedido de Compras",
        "'Remoto'": "Remoto",
        "'In Loco'": "In Loco",
        "'Terceirizado'":"Terceirizado",
    }
  const tipoAtendimento = row.TIPO_ATENDIMENTO?.trim()
    if (comprasMap[tipoAtendimento]) row.TIPO_ATENDIMENTO = comprasMap[tipoAtendimento]

    // --- 6. Substituir Local para fins estéticos
  const localMap: Record<string,string> = {
        "'Indústria'": "Industria",
        "'Atacadista/Matriz'": "Atacadista/Matriz",
    }
  const local = row.LOCAL?.trim()
    if (localMap[local]) row.LOCAL = localMap[local]


    return row as ParsedRow;

}