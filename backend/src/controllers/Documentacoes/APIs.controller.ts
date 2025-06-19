import { Request, Response } from 'express';
import {
  getAllSections,
  getRoutesBySection,
  createSection,
  createRoute,
  updateSection,
  removeSection,
  updateRoute,
  removeRoute,
} from '../../services/Documentacao/apiBD.service';
import { logger } from '../../utils/logger';

/**
 * Lista todas as Sections cadastradas no banco.
 *
 * @param _req Express request
 * @param res Express response
 * @returns JSON com as seções encontradas
 */
export const listSections = async (req: Request, res: Response) => {
  try {
    const sections = await getAllSections(); // <- aqui estava o erro
    res.json(sections);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao buscar seções' });
  }
};

/**
 * Adiciona uma nova Section ao banco de dados.
 *
 * @param req Express request contendo `title` e `display_order`
 * @param res Express response
 * @returns Section criada
 */
export const addSections = async (req: Request, res: Response) => {
  const { title, display_order } = req.body;
  try {
    const section = await createSection(title, Number(display_order));
    res.status(201).json(section);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao criar seção' });
  }
};

/**
 * Edita uma Section existente.
 *
 * @param req Express request com params.id e body
 * @param res Express response
 */
export const editSections = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, display_order } = req.body;

  try {
    const result = await updateSection(id, title, display_order);
    res.json(result);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao editar seção' });
  }
};

/**
 * Remove uma Section do banco de dados.
 *
 * @param req Express request com params.id
 * @param res Express response
 */
export const deleteSections = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await removeSection(id);
    res.status(204).send(); // No content
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao remover seção' });
  }
};



/**
 * Lista rotas pertencentes a uma Section.
 *
 * @param req Express request com params.sectionId
 * @param res Express response
 */
export const listRoutesBySection = async (req: Request, res: Response) => {
  const sectionId = Number(req.params.sectionId);
  const routes = await getRoutesBySection(sectionId);
  res.json(routes);
};

/**
 * Adiciona uma nova rota vinculada a uma Section.
 *
 * @param req Express request contendo dados da rota
 * @param res Express response
 * @returns Rota criada
 */
export const addRoutesBySection = async (req: Request, res: Response) => {
  const { section_id, method, url, description, display_order } = req.body;
  try {
    const route = await createRoute(
      Number(section_id),
      method,
      url,
      description || '',
      Number(display_order)
    );
    res.status(201).json(route);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao criar rota' });
  }
};

/**
 * Edita uma rota existente.
 *
 * @param req Express request com params.id e body
 * @param res Express response
 */
export const editRouteBySection = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { section_id, method, url, description, display_order } = req.body;

  try {
    const result = await updateRoute(id, section_id, method, url, description, display_order);
    res.json(result);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao editar rota' });
  }
};

/**
 * Remove uma rota vinculada a uma Section.
 *
 * @param req Express request com params.id
 * @param res Express response
 */
export const deleteRouteBySection = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await removeRoute(id);
    res.status(204).send(); // No content
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erro ao remover rota' });
  }
};
