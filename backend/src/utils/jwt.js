const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const logger = require('../config/logger');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired access token');
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { refreshToken: true, role: true },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    return { userId: decoded.userId, role: user.role };
  } catch (error) {
    logger.error('Refresh token verification failed:', error.message);
    throw new Error('Invalid or expired refresh token');
  }
};

const rotateTokens = async (refreshToken) => {
  const { userId, role } = await verifyRefreshToken(refreshToken);
  
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId, role);
  
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateTokens,
};
