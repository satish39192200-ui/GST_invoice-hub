import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (payload: {
    id: string;
    email: string;
    role: string;
    gstin: string;
}) => string;
//# sourceMappingURL=auth.d.ts.map