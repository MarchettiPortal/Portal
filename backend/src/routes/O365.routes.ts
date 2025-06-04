import { Router } from 'express';
import { getAllUsers, getTeamsGroupsWithMembers, getActiveUsersWithMail } from '../services/O365/O365.Graph.service';

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
router.get('/sharepointgroups', async (req, res) => {
  try {
    const groupsShare = await getTeamsGroupsWithMembers();
    res.json(groupsShare);
  } catch (error: any) {
    console.error('Erro ao buscar grupos do SharePoint:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Gerar excel com usuarios com e-mail e ativos
router.get('/email', async (req, res) => {
  try {
    const buffer  = await getActiveUsersWithMail();
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios-ativos.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);  
    } catch (error: any) {
     console.error('Erro ao gerar Excel:', error.message);
    res.status(500).json({ error: 'Erro ao gerar planilha' });
    }
});


export default router;
