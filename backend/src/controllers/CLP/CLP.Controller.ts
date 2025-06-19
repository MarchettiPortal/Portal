import { Request, Response } from 'express'
import { ClpOpcaoPayload } from '../../types/clp.ftp'
import * as clpRepo from '../../repositories/clp.repository';

// Listar CLP
export const listarClps = async (_req: Request, res: Response) => {
  const clps = await clpRepo.findActiveClps();
  res.json(clps);
};

export const adicionarClp = async (req: Request, res: Response) => {
  const { nome, ip, ativo, sistema_clp } = req.body;
  if (!nome || !ip || !sistema_clp) {
    res.status(400).json({ error: 'Nome, IP e Sistema obrigatórios' });
    return;
  }
  try {
    await clpRepo.insertClp({ nome, ip, ativo, sistema_clp });
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao adicionar CLP' });
  }
};

export const removerClp = async (req: Request, res: Response) => {
  const { id } = req.params;
  await clpRepo.disableClp(Number(id));
  res.json({ success: true });
};

export async function atualizarOpcaoCLP(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload;
  await clpRepo.updateClp(id, { nome, ip, ativo, sistema_clp });
}
