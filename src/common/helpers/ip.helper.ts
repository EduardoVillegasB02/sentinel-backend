import { Request } from 'express';

export const getIP = (req: Request): string => {
  const lan = req.headers['x-client-lan-ip'];
  if (typeof lan === 'string') return lan;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  const remote = req.socket.remoteAddress;
  if (typeof remote === 'string') return remote;
  return '';
};
