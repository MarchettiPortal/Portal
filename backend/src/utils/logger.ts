import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * Garante que a pasta de Logs existe
 */
const logDir = path.resolve('logs');
fs.mkdir(logDir, { recursive: true }).catch(() => { /* ignore */ });

/**
 * Instância configurada do Winston para gravação de logs da aplicação.
 */
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5
    })
  ]
});

/**
 * Só loga se não for produção
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}
