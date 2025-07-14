import cron from 'node-cron';
import { syncAllTeamsGroupsAndMembers } from '../services/O365/SyncGroup.service'
import { logger } from '../utils/logger';

/**
 *Inicializa worker responsável por sincronizar membros e grupos do Teams
 */
logger.info('⏱️ Worker de sincronização inicializado');
cron.schedule('0 * * * *', async () => {
  logger.info(`[${new Date().toISOString()}] Iniciando sincronização...`);
  try {
    await syncAllTeamsGroupsAndMembers();
    logger.info(`[${new Date().toISOString()}] ✅ Sincronização concluída.`);
  } catch (e) {
    logger.error(`[${new Date().toISOString()}] ❌ Erro ao sincronizar: ${String(e)}`);
  }
});
