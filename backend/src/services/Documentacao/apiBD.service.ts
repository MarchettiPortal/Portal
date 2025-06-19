import pool from "../../config/Global/db.config";
import * as docApiRepo from '../../repositories/docApi.repository';

// ** Sections **
// Lista todas as Sections cadastradas no banco
export const getAllSections = async () => docApiRepo.findAllSections();


// Adiciona Sections ao banco de dados
export const createSection = async (title: string, displayOrder: number) => docApiRepo.insertSection(title, displayOrder);


// Edita Sections ao banco de dados
export const updateSection = async (id: number, title: string, displayOrder: number) =>
  docApiRepo.updateSection(id, title, displayOrder);

// Remove Sections ao banco de dados
export const removeSection = async (id: number) => docApiRepo.removeSection(id);



// ** Routes x Sections **

// Lista todas as Routes x Sections cadastradas no banco
export const getRoutesBySection = async (sectionId: number) => docApiRepo.findRoutesBySection(sectionId);

// Cria Routes x Sections no banco
export const createRoute = async (
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => docApiRepo.insertRoute(sectionId, method, url, description, displayOrder);

// Edita Routes x Sections no banco
export const updateRoute = async (
  id: number,
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => docApiRepo.updateRoute(id, sectionId, method, url, description, displayOrder);

// Remove Routes x Sections no banco
export const removeRoute = async (id: number) => docApiRepo.removeRoute(id);

