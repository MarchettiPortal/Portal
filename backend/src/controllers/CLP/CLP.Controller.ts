import { Request, Response, NextFunction } from 'express';
import { ClpOpcaoPayload } from '../../types/clp.ftp'
import * as clpRepo from '../../repositories/clp.repository';
import * as clpService from '../../services/CLP/CLP.Att.service';

// Listar CLP
export const listarClps = async (_req: Request, res: Response) => {
  const clps = await clpRepo.findActiveClps();
  res.json(clps);
};

/**
 * Adiciona um novo CLP ao banco de dados.
 */
export const adicionarClp = async (req: Request, res: Response) => {
  const { nome, ip, ativo, sistema_clp } = req.body;
  try {
    await clpRepo.insertClp({ nome, ip, ativo, sistema_clp });
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao adicionar CLP' });
  }
};

/**
 * Desativa um CLP existente.
 */
export const removerClp = async (req: Request, res: Response) => {
  const { id } = req.params;
  await clpRepo.disableClp(Number(id));
  res.json({ success: true });
};

/**
 * Atualiza informações de um CLP.
 */
export async function atualizarOpcaoCLP(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload;
  await clpRepo.updateClp(id, { nome, ip, ativo, sistema_clp });
}


/**
 * Obtém status atual do CLP configurado.
 * @route GET /api/clp/status
 * @returns Status do CLP
 */
export const getClpStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await clpService.fetchClpStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualiza configuração do CLP.
 * @route POST /api/clp/set
 * @param req.body.ip string
 * @param req.body.userID string
 */
export const setClpConfig = async (req: Request, res: Response, next: NextFunction) => {
  const { ip, userID } = req.body;
  try {
    const data = await clpService.updateClpConfig(ip, userID);
    res.json(data);
  } catch (err) {
    next(err);
  }
};