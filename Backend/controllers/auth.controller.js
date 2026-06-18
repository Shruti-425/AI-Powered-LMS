const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db.config');
const { JWT_SECRET } = require('../middleware/auth.middleware');

const TOKEN_EXPIRY = '7d';
const RESET_EXPIRY_HOURS = 1;

const sanitizeUser = (user) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

const mapRegisterRole = (role) => {
  if (role === 'teacher' || role === 'instructor') return 'instructor';
  if (role === 'admin') return 'admin';
  return 'student';
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const dbRole = mapRegisterRole(role || 'student');

  try {
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, dbRole]
    );

    const user = { user_id: result.insertId, name, email, role: dbRole };
    const token = signToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const [rows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(200).json({
        message: 'If that email exists, a reset link has been generated',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [rows[0].user_id, token, expiresAt]
    );

    res.status(200).json({
      message: 'Password reset token generated',
      resetToken: token,
      expiresAt,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const [tokens] = await db.query(
      `SELECT prt.*, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.user_id = prt.user_id
       WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetRecord = tokens[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [
      hashedPassword,
      resetRecord.user_id,
    ]);
    await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE token_id = ?', [
      resetRecord.token_id,
    ]);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};
