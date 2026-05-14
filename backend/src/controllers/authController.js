const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateTokens, rotateTokens } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email already registered' 
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'STUDENT',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  logger.info(`User registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
  });
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'Refresh token required' 
    });
  }

  const { accessToken, refreshToken: newRefreshToken } = await rotateTokens(refreshToken);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  logger.info(`User logged out: ${userId}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  getProfile,
};
