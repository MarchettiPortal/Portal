import axios from 'axios';
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





