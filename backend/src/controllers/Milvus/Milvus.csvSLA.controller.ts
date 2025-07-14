import { Request, Response } from "express";
import { processCSV } from "../../services/Milvus/csvSLA.Proc.service.js";
import { downloadCSV} from "../../services/Milvus/csvSLA.dwnl.service.js"
import { logger } from "../../utils/logger"


// ** Funções **

/**
 * Baixa e processa o CSV do milvus, armazenando os dados no Banco de Dados
 * This version does not depend on HTTP context and can be reused by workers.
 */
export async function refreshCSVData() {
    await downloadCSV();
    await processCSV();
}

/**
 * HTTP handler to manually trigger CSV refresh.
 *
 * @param _req Express request object (unused).
 * @param res Express response confirming the refresh execution.
 */
export async function getRefresh(req: Request, res: Response) {
    try {
        await refreshCSVData();
        res.status(200).json({ message: "Refresh Manual/Semanal com sucesso!" });
    } catch(error) {
        logger.error("Erro ao Baixar o CSV:", error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message || "Erro ao realizar Refresh Manual/Semanal!" });
        } else {
            res.status(500).json({ error: "Erro desconhecido ao realizar Refresh Manual/Semanal!" });
        }
    }
}