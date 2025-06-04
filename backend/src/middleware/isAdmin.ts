// src/middlewares/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.officeLocation !== 'TI - Infraestrutura') {
    //console.log(req.user?.officeLocation)
    res.status(403).send('Acesso restrito a administradores');
    return 
  }

  next();
}