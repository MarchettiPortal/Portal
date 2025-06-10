import { Request, Response } from 'express';
import { getADGroups, createADUser, getADServiceStatus } from '../../services/AD/AD.UserSync.service';

export const listGroups = async (req: Request, res: Response) => {
  try {
    const groups = await getADGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const user = await createADUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
};

export const checkStatus = async (req: Request, res: Response) => {
  try {
    const status = await getADServiceStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status', details: error });
  }
};
