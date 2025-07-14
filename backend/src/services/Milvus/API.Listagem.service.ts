import axios from 'axios';
import dotenvConfig from '../../config/Milvus/dotenv.milvus.config';
import { logger } from '../../utils/logger';

const MILVUS_API_URL = dotenvConfig.URL_LISTAGEM_MILVUS;
const TOKEN = dotenvConfig.API_MILVUS_LISTAGEM;

/**
 * Consulta a API do Milvus e retorna os últimos chamados.
 *
 * @param qtd Quantidade máxima de registros a serem buscados.
 * @returns Lista de chamados obtidos da API ou array vazio em caso de erro.
 */
export async function buscarUltimosChamados(qtd: number = 200) {
  try {
    const response = await axios.post(
      MILVUS_API_URL,
      {
        filtro_body: {
          'codigo':"",
          'mesa_trabalho':"Mesa Infra",
          'status':"",
          'prioridade':"",
          'tecnico':""
        },
        total_registros: qtd,
        order_by: 'data_criacao',
        is_descending: true,
        pagina: 1
      },
      {
        headers: {
          Authorization: TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

      return response.data.lista;

  }catch (error: any) {
    logger.error('❌ Erro ao buscar chamados:', error.response?.data || error.message);
    return[];
  }
}
