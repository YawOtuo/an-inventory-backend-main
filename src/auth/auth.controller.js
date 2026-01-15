const db = require('../../models');
const User = db.User;
const Shop = db.Shop;
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.utils');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      acceptedIntoShop: false,
      shopId: null, // No shop initially
    });

    // Generate tokens
    const userData = {
      id: newUser.id,
      email: newUser.email,
      shopId: newUser.shopId,
    };

    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Return user data (without password) and tokens
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      shopId: newUser.shopId,
      acceptedIntoShop: newUser.acceptedIntoShop,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has a password (for existing users without password)
    if (!user.password) {
      return res.status(401).json({ message: 'Please set a password for your account' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const userData = {
      id: user.id,
      email: user.email,
      shopId: user.shopId,
    };

    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Return user data (without password) and tokens
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      shopId: user.shopId,
      acceptedIntoShop: user.acceptedIntoShop,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = verifyToken(token);

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Get user from database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const userData = {
      id: user.id,
      email: user.email,
      shopId: user.shopId,
    };

    const accessToken = generateAccessToken(userData);

    res.json({ accessToken });
  } catch (error) {
    if (error.message === 'Token has expired' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Logout (stateless, just returns success)
 * In a stateless system, logout is handled client-side by removing tokens
 */
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

/**
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is attached by auth middleware
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    if (!user.password) {
      return res.status(400).json({ message: 'No password set for this account' });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Connect user to a shop
 */
const connectToShop = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    // Verify shop exists
    const shop = await Shop.findByPk(shopId);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Get user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's shopId
    await user.update({
      shopId: shopId,
      acceptedIntoShop: false, // Pending approval
    });

    // Return updated user (without password)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    res.json({
      message: 'Successfully connected to shop',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Connect to shop error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword,
  connectToShop,
};


