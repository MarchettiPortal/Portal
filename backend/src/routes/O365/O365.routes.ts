import { Router } from 'express';
import { getAllUsers, getTeamsGroupsWithMembers } from '../../services/O365/O365.Graph.service';
import { sincronizarGruposComBanco } from '../services/CMDB/sincronizacao.service';

const router = Router();

// Buscar todos os usuários
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Buscar grupos do Sharepoint conectados ao Teams e Popula banco de Dados
router.get('/sharepointgroups', async (req, res) => {
  try {
    const groupsShare = await getTeamsGroupsWithMembers();
    res.json(groupsShare);
  } catch (error: any) {
    console.error('Erro ao buscar grupos do SharePoint:', error.message);
    res.status(400).json({ error: error.message });
  }
});



export default router;
