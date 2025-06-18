import 'dotenv/config';
import { getEnvVar } from '../../utils/env';

const dotenvConfig = {
  URL_CSV_MLVUS: getEnvVar('URL_CSV_MLVUS'),
  URL_LISTAGEM_MILVUS: getEnvVar('URL_LISTAGEM_MILVUS'),
  API_MILVUS: getEnvVar('API_MILVUS'),
  API_MILVUS_LISTAGEM: getEnvVar('API_MILVUS_LISTAGEM'),
  PATH_CSV_SLA: getEnvVar('PATH_CSV_SLA'),
};

export default dotenvConfig;
