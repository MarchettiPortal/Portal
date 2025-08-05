import cron from 'node-cron';
import { syncAllTeamsGroupsAndMembers } from '../services/O365/SyncGroup.service';
import { logger } from '../utils/logger';

logger.info('🗓️ Agendador O365 iniciado via PM2');

// Executa todo início de hora (pode ajustar depois)
cron.schedule('0 * * * *', async () => {
  try {
    logger.info(`[${new Date().toISOString()}] Iniciando sincronização O365...`);
    await syncAllTeamsGroupsAndMembers();
    logger.info(`[${new Date().toISOString()}] ✅ Sincronização O365 concluída`);
  } catch (e) {
    logger.error(`[${new Date().toISOString()}] ❌ Erro na sincronização O365: ${String(e)}`);
  }
});
