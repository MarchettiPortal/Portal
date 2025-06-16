import axios from 'axios';
import { pool } from '../../config/Global/db.config';
import { getAppTokenGraph } from './Graph.Token.service';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface ADGrupo { id: string; nome: string }
interface ADUser { id: string; name: string; email: string; groups: ADGrupo[] }

interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
}

interface GraphGroup {
  id: string;
  displayName: string;
}

interface GraphResponse<T> {
  value: T[];
}

// --- Função principal para sincronizar tudo
export async function syncAllTeamsGroupsAndMembers() {
  const token = await getAppTokenGraph();
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Lista os grupos com recurso de Teams
  const { data } = await axios.get<GraphResponse<GraphGroup & { resourceProvisioningOptions: string[] }>>(
    `${GRAPH_BASE}/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$select=id,displayName,resourceProvisioningOptions`,
    { headers }
  );

  const grupos = data.value;

  // 2. Cria mapa de usuários com seus grupos
  const userMap = new Map<string, ADUser>();

  for (const grupo of grupos) {
    try {
      const res = await axios.get<GraphResponse<GraphUser>>(
        `${GRAPH_BASE}/groups/${grupo.id}/members?$select=id,displayName,mail`,
        { headers }
      );

      for (const membro of res.data.value) {
        // Filtra membros inválidos
        if (!membro.id || !membro.mail) continue;

        if (!userMap.has(membro.id)) {
          userMap.set(membro.id, {
            id: membro.id,
            name: membro.displayName,
            email: membro.mail,
            groups: [],
          });
        }

        userMap.get(membro.id)!.groups.push({ id: grupo.id, nome: grupo.displayName });
      }
    } catch (error: any) {
      console.error(`Erro ao buscar membros do grupo ${grupo.displayName}:`, error.message);
    }
  }

  // 3. Executa a sincronização no banco
  for (const user of userMap.values()) {
    await syncUserAndGroups(user);
  }

  console.log(`Sincronização concluída: ${userMap.size} usuários processados.`);
}

// --- Função auxiliar que sincroniza um usuário e seus grupos
export async function syncUserAndGroups(user: ADUser) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert em usuarios
    await client.query(
      `INSERT INTO usuarios (id, email, nome)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE
       SET email = EXCLUDED.email,
           nome  = EXCLUDED.nome;`,
      [user.id, user.email, user.name]
    );

    // Upsert nos grupos e vínculos
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

    // Remove vínculos obsoletos
    const groupIdsAtuais = user.groups.map((g) => g.id);
    if (groupIdsAtuais.length > 0) {
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
    console.error('Erro ao sincronizar usuário e grupos AD:', err);
    throw err;
  } finally {
    client.release();
  }
}
