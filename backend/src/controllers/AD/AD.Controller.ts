import { Request, Response } from 'express';
import { getADGroups, createADUser, getADServiceStatus } from '../../services/AD/AD.UserSync.service';

/**
 * Lista todos os grupos existentes no Active Directory.
 *
 * @param _req Objeto `Request` do Express (não utilizado).
 * @param res Objeto `Response` utilizado para retornar os grupos encontrados.
 * @returns Promessa que resolve com a resposta HTTP contendo os grupos.
 * @throws Retorna HTTP 500 em caso de falha na chamada de serviço.

 */
export const listGroups = async (req: Request, res: Response) => {
  try {
    const groups = await getADGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error });
  }
};

/**
 * Cria um novo usuário no Active Directory a partir dos dados enviados.
 *
 * @param req Requisição contendo as informações do usuário.
 * @param res Resposta utilizada para retornar o usuário criado.
 * @returns Promessa resolvida com a resposta HTTP de criação.
 * @throws Retorna HTTP 500 caso a operação falhe.
 */
export const addUser = async (req: Request, res: Response) => {
  try {
    const user = await createADUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
};

/**
 * Consulta o status do serviço de sincronização com o Active Directory.
 *
 * @param _req Objeto `Request` do Express (não utilizado).
 * @param res Resposta utilizada para retornar as informações de status.
 * @returns Promessa resolvida com a resposta HTTP.
 * @throws Retorna HTTP 500 caso a consulta falhe.
 */
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const status = await getADServiceStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status', details: error });
  }
};
