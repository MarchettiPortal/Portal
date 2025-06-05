import { pool } from '../../config/Global/db.config';
import { getTeamsGroupsWithMembers } from './O365.Graph.service';


export async function syncGruposEUsuarios() {
  const gruposDoGraph = await getTeamsGroupsWithMembers();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const grupo of gruposDoGraph) {
      // 1) Upsert em ad_grupos (se não existir, insere; se existir, atualiza o nome)
      await client.query(
        `
        INSERT INTO ad_grupos (id, nome)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE
          SET nome = EXCLUDED.nome;
        `,
        [grupo.id, grupo.name]
      );

      // 2) Para cada membro, upsert em usuarios e em usuario_ad_grupo
      for (const membro of grupo.members) {
        // 2a) Upsert em usuarios
        await client.query(
          `
          INSERT INTO usuarios (id, email, nome)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                nome  = EXCLUDED.nome;
          `,
          [membro.id, membro.email, membro.nome]
        );

        // 2b) Insere vínculo em usuario_ad_grupo (se ainda não existir)
        await client.query(
          `
          INSERT INTO usuario_ad_grupo (usuario_id, grupo_id)
          VALUES ($1, $2)
          ON CONFLICT (usuario_id, grupo_id) DO NOTHING;
          `,
          [membro.id, grupo.id]
        );
      }
    }

 

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro no syncGruposEUsuarios:', err);
    throw err;
  } finally {
    client.release();
  }
}
