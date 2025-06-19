import { Request, Response } from 'express';
import { pool } from '../../config/Global/db.config';
import * as chamadosService from '../../services/Milvus/CRUD.Chamados.service.js';
import { logger } from '../../utils/logger';

// Função para calcular SLA total (Data de Solução - Data de Criação)
const calcularSLA = (dataCriacao: Date, dataSolucao: Date): number => {
  const diffMs = dataSolucao.getTime() - dataCriacao.getTime();
  return diffMs / (1000 * 60 * 60 * 24); // Converter para dias
};


// *********** CONSULTAS ***********

/** Lista todos os chamados. */
export const listarChamados = async (req: Request, res: Response) => {
  try {
    const chamados = await chamadosService.consultarChamados();
    res.status(200).json(chamados);
  } catch (error) {
    logger.error('Erro ao listar chamados:', error);
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
};

/** Agrupa chamados por setor. */
export const getChamadosPorSetor = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorSetor();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao buscar chamados por setor:', error);
    res.status(500).json({ error: 'Erro ao agrupar chamados por setor' });
  }
};

/** Agrupa chamados por Operador. */

export const getChamadosPorOperador = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorOperador();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por operador:', error);
    res.status(500).json({ error: 'Erro ao agrupar por operador' });
  }
};

/** Agrupa chamados por Prioridade. */
export const getChamadosPorPrioridade = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorPrioridade();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por prioridade:', error);
    res.status(500).json({ error: 'Erro ao agrupar por prioridade' });
  }
};

/** Agrupa chamados por SLA. */
export const getChamadosPorSLA = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorSLA();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por SLA:', error);
    res.status(500).json({ error: 'Erro ao agrupar por SLA' });
  }
};

/** Agrupa chamados por Local. */
export const getChamadosPorLocal = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosPorLocal();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao agrupar por local:', error);
    res.status(500).json({ error: 'Erro ao agrupar por local' });
  }
};

/** Agrupa chamados por Reabertos. */
export const getChamadosReabertos = async (req: Request, res: Response) => {
  try {
    const dados = await chamadosService.contarChamadosReabertos();
    res.json(dados);
  } catch (error) {
    logger.error('Erro ao contar reabertos:', error);
    res.status(500).json({ error: 'Erro ao contar reabertos' });
  }
};


/** Cria um novo chamado. */
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
    INSERT INTO chamados (
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

/** Atualiza campos de um chamado existente. */
export const editarChamado = async (req: Request, res: Response) => {
  const { CODIGO } = req.params;
  const { PRIORIDADE, NOTA_AVALIACAO } = req.body;

  const sqlText = `
    UPDATE chamados
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


/** Remove um chamado do banco de dados. */
export const excluirChamado = async (req: Request, res: Response) => {

  const { CODIGO } = req.params;
  const sqlText = `
      DELETE FROM chamados
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