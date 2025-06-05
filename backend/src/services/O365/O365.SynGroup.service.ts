import { pool } from '../../config/Global/db.config';

interface ADGrupo { id: string; nome: string }
interface ADUser { id: string; name: string; email: string; groups: ADGrupo[] }

export async function syncUserAndGroups(user: ADUser) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Upsert em usuarios
    await client.query(
      `
      INSERT INTO usuarios (id, email, nome)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            nome  = EXCLUDED.nome;
      `,
      [user.id, user.email, user.name]
    );

    // 2) Para cada grupo, upsert em ad_grupos e vincula em usuario_ad_grupo
    for (const g of user.groups) {
      await client.query(
        `
        INSERT INTO ad_grupos (id, nome)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE
          SET nome = EXCLUDED.nome;
        `,
        [g.id, g.nome]
      );

      await client.query(
        `
        INSERT INTO usuario_ad_grupo (usuario_id, grupo_id)
        VALUES ($1, $2)
        ON CONFLICT (usuario_id, grupo_id) DO NOTHING;
        `,
        [user.id, g.id]
      );
    }

    // 3) Remove vínculos antigos que não existam mais em user.groups
    const groupIdsAtuais = user.groups.map((g) => g.id);
    if (groupIdsAtuais.length > 0) {
      await client.query(
        `
        DELETE FROM usuario_ad_grupo
        WHERE usuario_id = $1
          AND grupo_id NOT IN (${groupIdsAtuais.map((_, i) => `$${i + 2}`).join(',')});
        `,
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
