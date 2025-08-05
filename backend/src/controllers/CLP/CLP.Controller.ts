import { Request, Response, NextFunction } from 'express';
import { ClpOpcaoPayload } from '../../types/clp.ftp'
import * as clpRepo from '../../repositories/clp.repository';
import * as clpService from '../../services/CLP/CLP.Att.service';

/**
 * Lista todos os CLPs da base de dados.
 *
 * @param _req Requisição Express.
 * @param res Resposta Express retornando a lista dos CLPs.
 * @returns Rotorno de Promise com a lista dos CLPs.
 */
export const listarClps = async (_req: Request, res: Response) => {
  const clps = await clpRepo.findActiveClps();
  res.json(clps);
};

/**
 * Insere um novo CLP na base de dados
 *
 * @param req Requisição Express contendo os dados do CLP.
 * @param res Resposta Express com sucesso ou falha.
 * @returns Retorno da Promise com a resposta HTTP.
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
 * Remove um CLP da base pelo seu ID.
 *
 * @param req Requisição Express com o parâmetro do ID do CLP.
 * @param res Reposta Express com a confirmação da operação.
 * @returns Retorno da Promise com a resposta HTTP.
 */
export const removerClp = async (req: Request, res: Response) => {
  const { id } = req.params;
  await clpRepo.disableClp(Number(id));
  res.json({ success: true });
};

/**
 * Atualiza os dados do CLP na base de dados.
 *
 * @param id Identificação do CLP pelo ID enviado.
 * @param payload Novos dados do CLP.
 * @returns Promise resolved when the update finishes.
 */

export async function atualizarOpcaoCLP(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload;
  await clpRepo.updateClp(id, { nome, ip, ativo, sistema_clp });
}


/**
 * Busca o status atual do CLP selecionado.
 *
 * @param _req Express request object (unused).
 * @param res Express response to return the status.
 * @param next Next middleware function for error handling.
 * @returns Promise resolving with the HTTP response.
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
 * Updates the CLP configuration and triggers the remote service.
 *
 * @param req Express request containing `ip` and `userID` fields.
 * @param res Express response returning the result from the remote service.
 * @param next Next middleware function for error propagation.
 * @returns Promise resolving with the HTTP response.
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