import { Request, Response } from 'express';
import { getAllSections, getRoutesBySection, createSection, createRoute, updateSection, removeSection, updateRoute, removeRoute} from '../../services/Documentacao/apiBD.service';


// ** Sections **

// Lista todas as Sections cadastradas no banco
export const listSections = async (req: Request, res: Response) => {
  try {
    const sections = await getAllSections(); // <- aqui estava o erro
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar seções' });
  }
};

// Adiciona Sections ao banco de dados
export const addSections = async (req: Request, res: Response) => {
  const { title, display_order } = req.body;
  if (!title || isNaN(Number(display_order))) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  try {
    const section = await createSection(title, Number(display_order));
    res.status(201).json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar seção' });
  }
};

// Edita Sections ao banco de dados
export const editSections = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, display_order } = req.body;

  if (!title || isNaN(display_order)) {
    res.status(400).json({ error: 'Dados inválidos' });
    return; 
  }

  try {
    const result = await updateSection(id, title, display_order);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar seção' });
  }
};

// Deleta Sections ao banco de dados
export const deleteSections = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await removeSection(id);
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover seção' });
  }
};





// ** Routes x Sections **

// Lista todas as API Routes x Sections cadastradas no banco
export const listRoutesBySection = async (req: Request, res: Response) => {
  const sectionId = Number(req.params.sectionId);
  if (isNaN(sectionId)) {
    res.status(400).json({ error: 'Invalid section ID' });
    return;
  }
  const routes = await getRoutesBySection(sectionId);
  res.json(routes);
};

// Adiciona API Routes x Sections no banco de dados
export const addRoutesBySection = async (req: Request, res: Response) => {
  const { section_id, method, url, description, display_order } = req.body;
  if (!section_id || !method || !url || isNaN(Number(display_order))) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
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
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar rota' });
  }
};


// Edita API Routes x Sections no banco de dados
export const editRouteBySection = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { section_id, method, url, description, display_order } = req.body;

  if (!section_id || !method || !url || isNaN(display_order)) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  try {
    const result = await updateRoute(id, section_id, method, url, description, display_order);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar rota' });
  }
};

// Remove API Routes x Sections no banco de dados
export const deleteRouteBySection = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await removeRoute(id);
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover rota' });
  }
};
