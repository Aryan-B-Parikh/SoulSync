/**
 * Authentication Controller
 * - register: DISABLED (returns 410) — use Google Sign-In
 * - login: kept for existing password users (backwards compat during transition)
 * - googleAuth: verifies Google ID token, silent-links or creates account
 */

const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/prisma');
const { hashPassword, verifyPassword, generateToken } = require('../services/auth.service');
const { toMongo } = require('../utils/formatter');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const hasGoogleIdField = prisma?._dmmf?.datamodel?.models?.some(
  (model) => model.name === 'User' && model.fields.some((field) => field.name === 'googleId'),
);

/**
 * Register — intentionally disabled.
 * Bots used to hammer this endpoint; all registration is now via Google.
 */
async function register(req, res) {
  return res.status(410).json({
    error: 'Email/password registration is disabled. Please use "Continue with Google".',
  });
}

/**
 * Login — kept for users who already have a password account.
 * Will be removed in a future release after all users have linked Google.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: toMongo({
        id: user.id,
        email: user.email,
        name: user.name,
        hasConsented: user.hasConsented,
      }),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google Auth — Silent Account Linking
 *
 * Flow:
 *   1. Frontend sends Google credential (ID token)
 *   2. We verify it with Google
 *   3. Check if email exists → link googleId (silent link) or create new user
 *   4. Return JWT + hasConsented so frontend can gate access
 */
async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email address' });
    }

    // Silent Link or Create
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const updateData = { lastLoginAt: new Date() };
      if (!user.googleId && hasGoogleIdField) updateData.googleId = googleId;

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    } else {
      // New user — create without password
      user = await prisma.user.create({
        data: {
          email,
          ...(hasGoogleIdField ? { googleId } : {}),
          name: name || email.split('@')[0],
          lastLoginAt: new Date(),
          // passwordHash intentionally omitted
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Authentication successful',
      token,
      user: toMongo({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: picture || null,
        hasConsented: user.hasConsented,
      }),
    });
  } catch (error) {
    // Google token verification failure
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Google token is invalid or expired. Please try again.' });
    }
    next(error);
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        personality: true,
        hasConsented: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: toMongo(user) });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: toMongo(user),
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
};
