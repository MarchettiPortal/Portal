import { Request, Response } from "express";
import { processCSV } from "../../services/Milvus/csvSLA.Proc.service.js";
import { downloadCSV} from "../../services/Milvus/csvSLA.dwnl.service.js"


// ** Funções **

// Função que Baixa e Processa o CSV de SLA do Milvus, e insere os valores no banco de dados
// Internal version without HTTP dependencies
export async function refreshCSVData() {
    await downloadCSV();
    await processCSV();
}
// HTTP handler version
export async function getRefresh(req: Request, res: Response) {
    try {
        await refreshCSVData();
        res.status(200).json({ message: "Refresh Manual/Semanal com sucesso!" });
    } catch(error) {
        console.error("Erro ao Baixar o CSV:", error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message || "Erro ao realizar Refresh Manual/Semanal!" });
        } else {
            res.status(500).json({ error: "Erro desconhecido ao realizar Refresh Manual/Semanal!" });
        }
    }
}