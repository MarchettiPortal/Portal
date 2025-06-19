import { Pool } from 'pg';
import 'dotenv/config';
import { getEnvVar } from '../../utils/env';

// Autenticação e variáveis para criação da POOL de conexão ao Banco de Dados, reutilizada no restante do backend
export const dbConfig = {
  user: getEnvVar('PG_USER'), 
  host: getEnvVar('PG_HOST'),
  database: getEnvVar('PG_DATABASE'),
  password: getEnvVar('PG_PASSWORD'),
  port: parseInt(getEnvVar('PG_PORT'), 10),
  max: 20,              // pool max connections
  min: 2,
  idleTimeoutMillis: 5 * 60 * 1000,
  connectionTimeoutMillis: 10000,
  application_name: getEnvVar('PG_APPLICATION_NAME')
};

// Criação e exportação do pool de conexões
export const pool = new Pool(dbConfig);



// DEBUG de conexão com Banco de Dados, apenas descomentar
/** 
pool.connect()
  .then((client) => {
    logger.log('Conectado ao banco de dados PostgreSQL!')
    client.release()
  })
  .catch((err) => {
    logger.error('Erro ao conectar ao PostgreSQL:', err)
  })
    */


export default pool;



