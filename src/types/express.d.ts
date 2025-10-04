import type { AccessTokenPayload } from '../services/tokenService.js';
import type { SafeUser } from '../utils/user.js';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      tokenPayload?: AccessTokenPayload;
    }
  }
}

export {};