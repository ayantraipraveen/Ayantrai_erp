import { Request } from 'express';

export interface DecodedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  roleSlug: string;
  permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}
