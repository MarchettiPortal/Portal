import { Pool } from 'pg';
import dotenv from 'dotenv';
import { application } from 'express';

// Carregar as variáveis de ambiente do .env
dotenv.config();

export const dbConfig = {
  user: process.env.PG_USER || '',
  host: process.env.PG_HOST || '',
  database: process.env.PG_DATABASE || '',
  password: process.env.PG_PASSWORD || '',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  max: 100,              // pool max connections
  min: 2,
  idleTimeoutMillis: 5 * 60 * 1000,
  connectionTimeoutMillis: 10000,
  application_name:process.env.PG_APPLICATION_NAME
};

// Criação do pool de conexões
export const pool = new Pool(dbConfig);


// Testar conexão apenas 1 vez no início
pool.connect()
  .then((client) => {
    //console.log('Conectado ao banco de dados PostgreSQL!')
    client.release()
  })
  .catch((err) => {
    console.error('Erro ao conectar ao PostgreSQL:', err)
  })
export default pool;



