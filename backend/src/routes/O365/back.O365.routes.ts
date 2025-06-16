import { Router } from 'express';
import { syncAllTeamsGroupsAndMembers } from '../../services/O365/SyncGroup.service';

const router = Router();

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
