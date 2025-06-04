export interface GroupData {
  id: string;
  name: string;
  members: string[];
  owners: string[];
}

export interface SitePermission {
  siteId: string;
  driveId: string;
  itemId: string;
  itemName: string;
  permissions: {
    grantedTo: string;
    roles: string[];
  }[];
}

  