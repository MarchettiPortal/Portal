import { Request, Response } from 'express';
import { getADGroups, createADUser, getADServiceStatus } from '../../services/AD/AD.UserSync.service';

/**
 * Handles the request to list all Active Directory groups.
 *
 * @param _req Express request object (unused).
 * @param res Express response used to return the list of groups.
 * @returns Promise resolving with the HTTP response.
 * @throws Returns HTTP 500 if the service call fails.
 */
export const listGroups = async (req: Request, res: Response) => {
  try {
    const groups = await getADGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error });
  }
};

/**
 * Creates a new user in Active Directory using the body of the request.
 *
 * @param req Express request containing the user data.
 * @param res Express response used to return the created user.
 * @returns Promise resolving with the HTTP response.
 * @throws Returns HTTP 500 if the service call fails.
 */
export const addUser = async (req: Request, res: Response) => {
  try {
    const user = await createADUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
};

/**
 * Returns the status of the AD synchronization service.
 *
 * @param _req Express request object (unused).
 * @param res Express response used to return the status information.
 * @returns Promise resolving with the HTTP response.
 * @throws Returns HTTP 500 if the service call fails.
 */
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const status = await getADServiceStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status', details: error });
  }
};
