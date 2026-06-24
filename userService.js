'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;

/**
 * Fetches a user by ID using a parameterized query.
 * @param {object} db - Database connection
 * @param {number} userId - The user's ID
 * @returns {Promise<object|null>} The user object or null
 */
async function getUserById(db, userId) {
  if (!userId || typeof userId !== 'number' || userId <= 0) {
    throw new TypeError('userId must be a positive number');
  }

  const result = await db.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0] ?? null;
}

/**
 * Creates a new user with a securely hashed password.
 * @param {object} db - Database connection
 * @param {string} name
 * @param {string} email
 * @param {string} plainPassword
 * @returns {Promise<object>} The created user
 */
async function createUser(db, name, email, plainPassword) {
  if (!name || !email || !plainPassword) {
    throw new Error('name, email, and password are required');
  }

  if (plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const result = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, passwordHash]
  );

  return result.rows[0];
}

/**
 * Verifies a user's password securely using bcrypt.
 * @param {string} plainPassword
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, storedHash) {
  return bcrypt.compare(plainPassword, storedHash);
}

/**
 * Generates a cryptographically secure random token.
 * @returns {string} A hex-encoded 32-byte token
 */
function generateSecureToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

module.exports = { getUserById, createUser, verifyPassword, generateSecureToken };
