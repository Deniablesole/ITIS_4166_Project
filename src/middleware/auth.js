import { verifyToken, getTokenFromHeader } from "../utils/auth.js";
import prisma from "../config/db.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req.headers.authorization);
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, username: true, email: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
};

export const requireOwnerorAdmin = (req, res, next) => {
    const resourceOwnerId = parseInt(req.params.userId);
    if (req.user.role !== 'admin' && req.user.id !== resourceOwnerId) {
        return res.status(403).json({ error: 'Forbidden: Owner or Admins only' });
    }
    next();
};