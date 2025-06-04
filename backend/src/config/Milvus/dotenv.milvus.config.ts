import "dotenv/config";

const dotenvConfig = {
    URL_CSV_MLVUS: process.env.URL_CSV_MLVUS!,
    URL_LISTAGEM_MILVUS: process.env.URL_LISTAGEM_MILVUS!,
    API_MILVUS: process.env.API_MILVUS!,
    API_MILVUS_LISTAGEM: process.env.API_MILVUS_LISTAGEM!,
    PATH_CSV_SLA: process.env.PATH_CSV_SLA!,
};

export default dotenvConfig;
