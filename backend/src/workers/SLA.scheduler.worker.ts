import { iniciarAgendador } from '../services/Milvus/csvSLA.Scheduler.service';
import { logger } from '../utils/logger';

logger.info('[SLA.scheduler] Agendador iniciado via PM2');
iniciarAgendador();
