import { Request, Response } from 'express';
import { pool } from '../../config/Global/db.config';
import * as chamadosService from '../../services/Milvus/CRUD.Chamados.service.js';
import { logger } from '../../utils/logger';


/**
 * Calcula o SLA em dias entre a criação e a solução de um chamado.
 *
 * @param dataCriacao Data de criação do chamado.
 * @param dataSolucao Data de solução do chamado.
 * @returns Quantidade de dias decorridos.
 */

const calcularSLA = (dataCriacao: Date, dataSolucao: Date): number => {
  const diffMs = dataSolucao.getTime() - dataCriacao.getTime();
  return diffMs / (1000 * 60 * 60 * 24); // Converter para dias
};


// *********** CONSULTAS ***********

 /**
 * Lista todos os chamados armazenados no banco.
 * @param _req Requisição Express (não utilizada).
 * @param res Resposta HTTP contendo array de chamados.
 * @returns Promessa resolvida quando a resposta é enviada.
 */
export const listarChamados = async (req: Request, res: Response) => {
  try {
    const chamados = await chamadosService.consultarChamados();
    res.status(200).json(chamados);
  } catch (error) {
    logger.error('Erro ao listar chamados:', error);
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
};

/**
 * Agrupa os chamados por setor de atendimento.
 * @param _req Requisição Express (não utilizada).
 * @param res Resposta HTTP com dados agregados.
 */
export const getChamadosPorSetor = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorSetor();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao buscar chamados por setor:', error);
    res.status(500).json({ error: 'Erro ao agrupar chamados por setor' });
  }
};

/**
 * Agrupa a quantidade de chamados resolvidos por cada operador.
 *
 * @param _req Requisição Express.
 * @param res Resposta com dados agrupados por operador.
 */

export const getChamadosPorOperador = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorOperador();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por operador:', error);
    res.status(500).json({ error: 'Erro ao agrupar por operador' });
  }
};

/**
 * Retorna estatísticas de chamados agrupadas por prioridade.
 *
 * @param _req Requisição Express.
 * @param res Resposta contendo o agrupamento por prioridade.
 */
export const getChamadosPorPrioridade = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorPrioridade();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por prioridade:', error);
    res.status(500).json({ error: 'Erro ao agrupar por prioridade' });
  }
};


/**
 * Agrupa chamados de acordo com o cumprimento do SLA.
 *
 * @param _req Requisição Express.
 * @param res Resposta com dados agrupados por SLA.
 */

export const getChamadosPorSLA = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorSLA();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por SLA:', error);
    res.status(500).json({ error: 'Erro ao agrupar por SLA' });
  }
};

/**
 * Obtém a contagem de chamados por localidade.
 *
 * @param _req Requisição Express.
 * @param res Resposta contendo o agrupamento por local.
 */
export const getChamadosPorLocal = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorLocal();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por local:', error);
    res.status(500).json({ error: 'Erro ao agrupar por local' });
  }
};

/**
 * Conta quantos chamados foram reabertos.
 *
 * @param _req Requisição Express.
 * @param res Resposta contendo a contagem de reaberturas.
 */
export const getChamadosReabertos = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosReabertos();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao contar reabertos:', error);
    res.status(500).json({ error: 'Erro ao contar reabertos' });
  }
};


/**
 * Insere um novo chamado na base de dados.
 *
 * @param req Corpo da requisição contendo os campos do chamado.
 * @param res Resposta com o chamado criado ou mensagem de erro.
 */

export const criarChamado = async (req: Request, res: Response) => {
  const {
  CODIGO, CATEGORIA, SUBCATEGORIA, LOCAL, SETOR, MES_CRIACAO, ANO_CRIACAO,
  DATA_CRIACAO, MES_SOLUCAO, ANO_SOLUCAO, DATA_SOLUCAO, TICKETS_ABERTOS,
  PRIORIDADE, NOME_OPERADOR, HORA_SOLUCAO, HORA_CRIACAO, NOTA_AVALIACAO,
  TICKETS_REABERTOS, DESCRICAO_AVALIACAO, TIPO_ATENDIMENTO,
  DESCRICAO, ASSUNTO, DESC_PAUSA, USUARIO_CHAMADO, MESA_TRABALHO
  } = req.body;


  const slaDias = calcularSLA(new Date(DATA_CRIACAO), new Date(DATA_SOLUCAO))

  const sqlText = `
    INSERT INTO log_milvus_chamados (
      codigo, categoria, subcategoria, local, setor,
      mes_criacao, ano_criacao, data_criacao,
      mes_solucao, ano_solucao, data_solucao,
      hora_criacao, hora_solucao, sla, tickets_abertos,
      prioridade, nome_operador, nota_avaliacao,
      tickets_reabertos, descricao_avaliacao, tipo_atendimento,
      descricao, assunto, desc_pausa, usuario_chamado, mesa_trabalho
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11,
      $12, $13, $14, $15,
      $16, $17, $18,
      $19, $20, $21,
      $22, $23, $24, $25, $26
    )
    ON CONFLICT (codigo) DO NOTHING
    RETURNING *
  `
  const params = [
    CODIGO, CATEGORIA, SUBCATEGORIA, LOCAL, SETOR,
    MES_CRIACAO, ANO_CRIACAO, DATA_CRIACAO,
    MES_SOLUCAO, ANO_SOLUCAO, DATA_SOLUCAO,
    HORA_CRIACAO, HORA_SOLUCAO, slaDias, TICKETS_ABERTOS,
    PRIORIDADE, NOME_OPERADOR, NOTA_AVALIACAO,
    TICKETS_REABERTOS, DESCRICAO_AVALIACAO, TIPO_ATENDIMENTO,
    DESCRICAO, ASSUNTO, DESC_PAUSA, USUARIO_CHAMADO, MESA_TRABALHO
  ]

  try {
    const { rows } = await pool.query(sqlText, params)
    if (rows.length === 0) {
      // Já existia um chamado com esse código
      res.status(409).json({ message: `Chamado ${CODIGO} já existe` })
      return
    }
    res.status(201).json(rows[0])
  } catch (error) {
    logger.error('Erro ao criar chamado:', error)
    res.status(500).json({ error: 'Erro ao criar chamado', details: error })
  }
  
}

/**
 * Atualiza campos específicos de um chamado.
 *
 * @param req Contém o código do chamado em params e dados no body.
 * @param res Resposta com registro atualizado ou erro.
 */
export const editarChamado = async (req: Request, res: Response) => {
  const { CODIGO } = req.params;
  const { PRIORIDADE, NOTA_AVALIACAO } = req.body;

  const sqlText = `
    UPDATE log_milvus_chamados
      SET prioridade = $1,
          nota_avaliacao = $2
    WHERE codigo = $3
    RETURNING *
  `
  const params = [PRIORIDADE, NOTA_AVALIACAO, CODIGO]

  try {
    const { rows } = await pool.query(sqlText, params)
    if (rows.length === 0) {
      res.status(404).json({ message: `Chamado ${CODIGO} não encontrado` })
      return 
    }
    res.json(rows[0])
  } catch (error) {
    logger.error('Erro ao editar chamado:', error)
    res.status(500).json({ error: 'Erro ao editar chamado', details: error })
  }
}


/**
 * Remove um chamado do banco de dados.
 *
 * @param req Contém o código do chamado a ser removido.
 * @param res Resposta com confirmação ou erro de remoção.
 */
export const excluirChamado = async (req: Request, res: Response) => {

  const { CODIGO } = req.params;
  const sqlText = `
      DELETE FROM log_milvus_chamados
      WHERE codigo = $1
      RETURNING *
    `
    try {
      const { rows } = await pool.query(sqlText, [CODIGO])
      if (rows.length === 0) {
        res.status(404).json({ message: `Chamado ${CODIGO} não encontrado` })
        return 
      }
      res.json({ message: `Chamado ${CODIGO} excluído`, deleted: rows[0] })
    } catch (error) {
      logger.error('Erro ao excluir chamado:', error)
      res.status(500).json({ error: 'Erro ao excluir chamado', details: error })
    }
  }

  /**
 * Retorna a contagem de chamados por tipo de atendimento para o ano especificado.
 */
export const getChamadosPorTipoAtendimento = async (req: Request, res: Response) => {
  const ano = Number(req.params.ano)

  if (Number.isNaN(ano)) {
    res.status(400).json({ error: 'Ano inválido' })
    return
  }

  try {
    const dados = await chamadosService.contarChamadosPorTipoAtendimento(ano)
    res.json(dados)
  } catch (error) {
    logger.error('Erro ao agrupar por tipo de atendimento:', error)
    res.status(500).json({ error: 'Erro ao agrupar por tipo de atendimento' })
  }
}