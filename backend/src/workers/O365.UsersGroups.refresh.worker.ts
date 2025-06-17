import cron from 'node-cron';
import { syncAllTeamsGroupsAndMembers } from '../services/O365/SyncGroup.service'

console.log('⏱️ Worker de sincronização inicializado');

cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Iniciando sincronização...`);
  try {
    await syncAllTeamsGroupsAndMembers();
    console.log(`[${new Date().toISOString()}] ✅ Sincronização concluída.`);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] ❌ Erro ao sincronizar:`, e);
  }
});
