import axios from 'axios';
import * as XLSX from 'xlsx';
import { getAppTokenGraph } from './O365.Graph.Token.service';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface GraphResponse<T> {
    value: T[];
}

interface GraphUser {
    displayName: string;
}

interface GraphGroup {
    id: string;
    displayName: string;
    mail?: string;
    resourceProvisioningOptions: string[];
}

// TODOS OS USUÁRIOS
export async function getAllUsers() {
  const token = await getAppTokenGraph();
  const { data } = await axios.get<GraphResponse<GraphUser>>(`${GRAPH_BASE}/users?$top=999`, {
    headers: { Authorization: `Bearer ${token}` },
  });
 
  return data;
}


// Grupos do Sharepoint Conectados ao Teams
export async function getTeamsGroupsWithMembers() {
  const token = await getAppTokenGraph();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Lista os grupos com Teams habilitado
  const { data } = await axios.get<GraphResponse<GraphGroup>>(
    `${GRAPH_BASE}/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$select=id,displayName,resourceProvisioningOptions`,
    { headers }
  );

  const groups = data.value;

  // Para cada grupo, busca os membros
  const results = await Promise.all(
    groups.map(async (group) => {
      try {
        const membersRes = await axios.get<GraphResponse<GraphUser>>(
          `${GRAPH_BASE}/groups/${group.id}/members?$select=displayName`,
          { headers }
        );

        const members = membersRes.data.value.map((m) => m.displayName);

        return {
          id: group.id,
          name: group.displayName,
          members,
        };
      } catch (error:any) {
        console.error(`Erro ao buscar membros do grupo ${group.displayName}:`, error.message);
        return {
          id: group.id,
          name: group.displayName,
          members: [],
        };
      }
    })
  );

  return results;
}

// Gera Excel dos usuários com Email e Conta habilitada
export async function getActiveUsersWithMail() {
  const token = await getAppTokenGraph();
  const headers = { Authorization: `Bearer ${token}` };

  let users: any[] = [];
  let nextUrl = `${GRAPH_BASE}/users?$filter=accountEnabled eq true&$select=id,displayName,mail&$top=100`;

  while (nextUrl) {
    const { data } = await axios.get(nextUrl, { headers });

    // Remove quem não tem e-mail
    const filtered = data.value.filter((user: any) => user.mail);

    // Verifica se têm licenças ativas
    for (const user of filtered) {
      try {
        const licenseRes = await axios.get(`${GRAPH_BASE}/users/${user.id}/licenseDetails`, { headers });
        const hasActiveLicense = licenseRes.data.value && licenseRes.data.value.length > 0;

        if (hasActiveLicense) {
          users.push({
            Nome: user.displayName,
            Email: user.mail,
          });
        }
      } catch (err) {
        console.warn(`Erro ao buscar licença do usuário ${user.displayName}:`, (err as any).message);
      }
    }

    nextUrl = data['@odata.nextLink'] || null;
  }

  const worksheet = XLSX.utils.json_to_sheet(users);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários Ativos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return  excelBuffer;
  
}



