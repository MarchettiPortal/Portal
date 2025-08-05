import pool from "../../config/Global/db.config";
import * as docApiRepo from '../../repositories/docApi.repository';

/**
 * Recupera todas as seções cadastradas na base de dados.
 *
 * @returns Lista de seções ordenada por display_order.
 */
export const getAllSections = async () => docApiRepo.findAllSections();


/**
 * Insere uma nova seção na documentação das APIs.
 *
 * @param title Título da seção.
 * @param displayOrder Ordem de exibição desejada.
 * @returns A seção criada.
 */
export const createSection = async (title: string, displayOrder: number) => docApiRepo.insertSection(title, displayOrder);


/**
 * Atualiza uma seção existente.
 *
 * @param id Identificador da seção.
 * @param title Novo título.
 * @param displayOrder Nova ordem de exibição.
 * @returns A seção atualizada.
 */
export const updateSection = async (id: number, title: string, displayOrder: number) =>
  docApiRepo.updateSection(id, title, displayOrder);

/**
 * Remove uma seção da documentação.
 *
 * @param id Identificador da seção.
 * @returns Void quando a exclusão é concluída.
 */
export const removeSection = async (id: number) => docApiRepo.removeSection(id);



// ** Routes x Sections **

/**
 * Lista rotas vinculadas a uma seção específica.
 *
 * @param sectionId ID da seção desejada.
 * @returns Rotas encontradas para a seção.
 */
export const getRoutesBySection = async (sectionId: number) => docApiRepo.findRoutesBySection(sectionId);


/**
 * Cria uma nova rota associada a determinada seção.
 *
 * @param sectionId ID da seção.
 * @param method Método HTTP da rota.
 * @param url Caminho da rota.
 * @param description Descrição opcional.
 * @param displayOrder Ordem de exibição na seção.
 * @returns A rota criada.
 */
export const createRoute = async (
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => docApiRepo.insertRoute(sectionId, method, url, description, displayOrder);


/**
 * Atualiza os dados de uma rota existente.
 *
 * @param id Identificador da rota.
 * @param sectionId Seção relacionada.
 * @param method Método HTTP.
 * @param url Caminho da rota.
 * @param description Descrição da rota.
 * @param displayOrder Nova ordem de exibição.
 * @returns A rota atualizada.
 */
export const updateRoute = async (
  id: number,
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => docApiRepo.updateRoute(id, sectionId, method, url, description, displayOrder);

/**
 * Exclui uma rota da documentação.
 *
 * @param id Identificador da rota.
 */
export const removeRoute = async (id: number) => docApiRepo.removeRoute(id);

