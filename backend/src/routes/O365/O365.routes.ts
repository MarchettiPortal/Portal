import { Router } from 'express';
import { getAllUsers } from '../../services/O365/O365.Graph.service';
import { syncAllTeamsGroupsAndMembers } from '../../services/O365/O365.SyncGroup.service';

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

// Buscar grupos do Sharepoint conectados ao Teams
router.get('/sync-teams-groups', async (req, res) => {
  try {
    await syncAllTeamsGroupsAndMembers();
    res.json({ message: 'Sincronização concluída com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao sincronizar grupos do Teams:', error.message);
    res.status(500).json({ error: 'Erro interno ao sincronizar grupos.' });
  }
});



export default router;
