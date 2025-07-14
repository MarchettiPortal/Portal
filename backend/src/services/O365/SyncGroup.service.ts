import axios from 'axios';
import { pool } from '../../config/Global/db.config';
import { getAppTokenGraph } from './Graph.Token.service';
import { promises as fs } from 'fs';
import path from 'path';
import { ADGrupo, ADUser, GraphGroup, GraphResponse, GraphUser } from '../../types/o365';
import { logger } from '../../utils/logger';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const MAX_CONCURRENT_MEMBERS = 20;
const GRUPO_SERVICO_ID = '36942453-8d12-42f2-a062-52b51a8b15a4';
const GRUPO_RECURSO_ID = '6ab3fc80-5528-4bca-ac50-2b39660ec470';
const syncQueue: Promise<void>[] = [];

// Diretório de logs
const logDir = path.resolve(process.cwd(), 'logs');


// --- Função principal
/**
 * Sincroniza grupos e usuários do Microsoft Teams no banco de dados.
 */
export async function syncAllTeamsGroupsAndMembers() {
  const token = await getAppTokenGraph();
  const headers = { Authorization: `Bearer ${token}` };
  
  const todosUsuarios = await getAllUsers(headers);   // Busca todos os usuários com paginação
  const userMap = new Map<string, ADUser>(); // Cria estrutura de grupos
  const servicoUserIds = await getServicoUserIds(headers); // Busca os usuários de serviços
  const recursoUserIds = await getRecursosUserIds(headers); // Busca todos os usuários de Recursos

  // Busca os Grupos vinculados ao Teams
  const grupoRes = await axios.get<GraphResponse<GraphGroup & { resourceProvisioningOptions: string[] }>>(
    `${GRAPH_BASE}/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$select=id,displayName,resourceProvisioningOptions`,
    { headers }
  );
  const grupos = grupoRes.data.value;

  // Lista os membros dos Grupos e vincula
  for (const grupo of grupos) {
    try {
      const membrosRes = await axios.get<GraphResponse<GraphUser>>(
        `${GRAPH_BASE}/groups/${grupo.id}/members?$select=id,displayName,mail`,
        { headers }
      );
      const membros = membrosRes.data.value.filter(m => m.id && m.mail);
      for (const membro of membros) {
        const jaExiste = userMap.has(membro.id);
        if (!jaExiste) {
          userMap.set(membro.id, {
            id: membro.id,
            name: membro.displayName,
            email: membro.mail,
            groups: [{ id: grupo.id, nome: grupo.displayName }],
          });
        } else {
          userMap.get(membro.id)!.groups.push({ id: grupo.id, nome: grupo.displayName });
        }
      }
    } catch (err) {
      logger.warn(`Erro ao obter membros do grupo ${grupo.displayName}: ${String(err)}`);
    }
  }

  // Mapeia os Nomes das licenças e Altera para mais visível
  const { data: skuData } = await axios.get(`${GRAPH_BASE}/subscribedSkus`, { headers });
  const skuMap = Object.fromEntries(skuData.value.map((s: any) => [s.skuId, s.skuPartNumber]));
  const SkuNomeMap: Record<string, string> = {
    O365_BUSINESS_ESSENTIALS: 'BUSINESS BASIC',
    O365_BUSINESS_PREMIUM: 'BUSINESS STANDARD',
    PROJECT_P1: 'PLANNER PLAN 1',
    PROJECT_PLAN3_DEPT: 'PLANNER AND PROJECT PLAN 3',
    POWER_BI_STANDARD: 'POWER BI GRATUITO',
  };

  // Processa os usuários ativos e que possuem licença
  for (let i = 0; i < todosUsuarios.length; i += MAX_CONCURRENT_MEMBERS) {
    const bloco = todosUsuarios.slice(i, i + MAX_CONCURRENT_MEMBERS);

    await Promise.allSettled(bloco.map(async (usuarioBase) => {
      let licencas: string[] = [];
      let ativo: boolean | undefined = undefined;

      try {
        const res = await axios.get<GraphUser>(
          `${GRAPH_BASE}/users/${usuarioBase.id}?$select=assignedLicenses,accountEnabled`,
          { headers }
        );

        ativo = res.data.accountEnabled ?? true;
                if (ativo === false) {
          await fs.appendFile(
            path.join(logDir, 'inativos.log'),
            `${new Date().toISOString()} | ${usuarioBase.mail} | accountEnabled: false\n`
          );
        }

        const allSkus = res.data.assignedLicenses?.map((l: any) => skuMap[l.skuId]) || [];
        licencas = allSkus
          .filter((sku) => sku && sku !== 'FLOW_FREE')
          .map((sku) => SkuNomeMap[sku] || sku);
      } catch (err) {
        logger.warn(`Erro ao buscar detalhes de ${usuarioBase.displayName}: ${(err as any)?.message || err}`);
      }

      const jaExiste = userMap.has(usuarioBase.id);
      const usuarioFinal: ADUser = {
        id: usuarioBase.id,
        name: usuarioBase.displayName,
        email: usuarioBase.mail ?? usuarioBase.userPrincipalName,
        groups: jaExiste ? userMap.get(usuarioBase.id)!.groups : [],
        licencas,
        ativo: ativo ?? false,
        servicos: servicoUserIds.has(usuarioBase.id),
        recursos: recursoUserIds.has(usuarioBase.id)
      };

      await fs.appendFile(
        path.join(logDir, 'salvos.log'),
        `${new Date().toISOString()} | ${usuarioFinal.email} | ${JSON.stringify({
          id: usuarioFinal.id,
          nome: usuarioFinal.name,
          email: usuarioFinal.email,
          ativo: usuarioFinal.ativo,
          servicos: usuarioFinal.servicos,
          licencas: usuarioFinal.licencas,
        })}\n`
      );
      // Insere no Banco de Dados
      syncQueue.push(syncUserAndGroups(usuarioFinal));
    }));
  }
  await Promise.all(syncQueue);
  logger.info('✅ Sincronização concluída');
}

/**
 * Recupera todos os usuários do Microsoft Graph usando paginação.
 *
 * @param headers Cabeçalhos de autorização para a API Graph.
 * @returns Array de usuários obtidos.
 */
async function getAllUsers(headers: Record<string, string>): Promise<GraphUser[]> {
  let url = `${GRAPH_BASE}/users?$select=id,displayName,mail,userPrincipalName`;
  const allUsers: GraphUser[] = [];

  while (url) {
    const res = await axios.get<GraphResponse<GraphUser>>(url, { headers });
    allUsers.push(...res.data.value.filter(u => u.id && (u.mail || u.userPrincipalName)));
    url = res.data['@odata.nextLink'] || '';
  }

  return allUsers;
}

/**
 * Sincroniza os dados de um usuário e seus grupos no banco de dados.
 *
 * @param user Objeto contendo dados completos do usuário.
 */
async function syncUserAndGroups(user: ADUser) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO usuarios (id, email, nome, licenca, ativo, servicos, recursos)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
       SET email = EXCLUDED.email,
           nome = EXCLUDED.nome,
           licenca = EXCLUDED.licenca,
           ativo = EXCLUDED.ativo,
           servicos = EXCLUDED.servicos,
           recursos = EXCLUDED.recursos;`,
    [user.id, user.email, user.name, user.licencas?.join(', ') || null, user.ativo ?? false, user.servicos ?? false, user.recursos ?? false]
    );

    if (user.groups.length > 0) {
      for (const g of user.groups) {
        await client.query(
          `INSERT INTO ad_grupos (id, nome)
           VALUES ($1, $2)
           ON CONFLICT (id) DO UPDATE
           SET nome = EXCLUDED.nome;`,
          [g.id, g.nome]
        );

        await client.query(
          `INSERT INTO usuario_ad_grupo (usuario_id, grupo_id)
           VALUES ($1, $2)
           ON CONFLICT (usuario_id, grupo_id) DO NOTHING;`,
          [user.id, g.id]
        );
      }

      const groupIdsAtuais = user.groups.map((g) => g.id);
      await client.query(
        `DELETE FROM usuario_ad_grupo
         WHERE usuario_id = $1
           AND grupo_id NOT IN (${groupIdsAtuais.map((_, i) => `$${i + 2}`).join(',')});`,
        [user.id, ...groupIdsAtuais]
      );
    } else {
      await client.query(
        `DELETE FROM usuario_ad_grupo WHERE usuario_id = $1;`,
        [user.id]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`Erro ao sincronizar usuário ${user.name}:`, err);
  } finally {
    client.release();
  }
}

// --- Identifica conta de serviço
/**
 * Obtém os IDs de usuários pertencentes ao grupo de contas de serviço.
 *
 * @param headers Cabeçalhos para autenticação na API Graph.
 * @returns Conjunto de IDs de usuários de serviço.
 */
async function getServicoUserIds(headers: Record<string, string>): Promise<Set<string>> {
  const ids = new Set<string>();
  let url = `${GRAPH_BASE}/groups/${GRUPO_SERVICO_ID}/members?$select=id`;

  while (url) {
    const res = await axios.get<GraphResponse<{ id: string }>>(url, { headers });
    for (const u of res.data.value) {
      ids.add(u.id);
    }
    url = res.data['@odata.nextLink'] || '';
  }

  return ids;
}

/**
 * Obtém os IDs de usuários classificados como recursos (salas, equipamentos).
 *
 * @param headers Cabeçalhos para autenticação na API Graph.
 * @returns Conjunto de IDs identificados como recursos.
 */
async function getRecursosUserIds(headers: Record<string, string>): Promise<Set<string>> {
  const ids = new Set<string>();
  let url = `${GRAPH_BASE}/groups/${GRUPO_RECURSO_ID}/members?$select=id`;

  while (url) {
    const res = await axios.get<GraphResponse<{ id: string }>>(url, { headers });
    for (const u of res.data.value) ids.add(u.id);
    url = res.data['@odata.nextLink'] || '';
  }

  return ids;
}
