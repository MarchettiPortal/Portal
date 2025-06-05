import axios from 'axios';
import * as XLSX from 'xlsx';
import { getAppTokenGraph } from './O365.Graph.Token.service';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface GraphResponse<T> {
    value: T[];
}

interface GraphUser {
    displayName: string;
    id: string;
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
  const headers = { Authorization: `Bearer ${token}` };

  // 1) Lista todos os grupos com Teams habilitado
  const { data } = await axios.get<GraphResponse<GraphGroup>>(
    `${GRAPH_BASE}/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')&$select=id,displayName,resourceProvisioningOptions`,
    { headers }
  );
  const groups = data.value;

  // 2) Para cada grupo, pega os membros (apenas displayName e id)
  const results = await Promise.all(
    groups.map(async (group) => {
      try {
        const membersRes = await axios.get<GraphResponse<GraphUser>>(
          `${GRAPH_BASE}/groups/${group.id}/members?$select=id,displayName,userPrincipalName`,
          { headers }
        );
        const members = membersRes.data.value.map(m => ({
          id: m.id as string,
          nome: m.displayName as string,
          email: (m as any).userPrincipalName as string
        }));
        return {
          id: group.id,
          name: group.displayName,
          members,
        };
      } catch (error: any) {
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


