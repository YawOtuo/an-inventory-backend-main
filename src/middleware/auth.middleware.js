const { verifyToken } = require('../utils/jwt.utils');
const db = require('../../models');
const User = db.User;

/**
 * Authentication middleware to verify JWT tokens
 * Attaches user to request object if token is valid
 */
const authMiddleware = async(req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header provided' });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            shopId: user.shopId,
            acceptedIntoShop: user.acceptedIntoShop,
        };

        next();
    } catch (error) {
        if (error.message === 'Token has expired' || error.message === 'Invalid token') {
            return res.status(401).json({ message: error.message });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided, but attaches user if token is valid
 */
const optionalAuthMiddleware = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                shopId: user.shopId,
                acceptedIntoShop: user.acceptedIntoShop,
            };
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
};
