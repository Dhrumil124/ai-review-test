'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Using 12 salt rounds (more secure than the default of 10)
const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;

/**
 * Fetches a user by ID using a parameterized query.
 * @param {object} db - Database connection
 * @param {number} userId - The user's ID (must be an integer)
 * @returns {Promise<object|null>} The user object or null
 */
async function getUserById(db, userId) {
  // Fix: Check if userId is a valid integer
  if (!Number.isInteger(userId)) {
    throw new TypeError('Invalid user ID: must be an integer');
  }

  // Fix: Handle database query failures with try-catch
  try {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Creates a new user with validation and secure password hashing.
 * @param {object} db - Database connection
 * @param {string} name - The user's name
 * @param {string} email - The user's email address
 * @param {string} plainPassword - The user's plain password
 * @returns {Promise<object>} The created user
 */
async function createUser(db, name, email, plainPassword) {
  // Fix: Validate input types are strings
  if (typeof name !== 'string' || typeof email !== 'string' || typeof plainPassword !== 'string') {
    throw new TypeError('Name, email, and password must be strings');
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail) {
    throw new Error('Name and email cannot be empty');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error('Invalid email format');
  }

  // Fix: Validate password complexity (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(plainPassword)) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  // Fix: Handle database query failures with try-catch
  try {
    const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    const query = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at';
    const result = await db.query(query, [trimmedName, trimmedEmail, passwordHash]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Verifies a plain password against a hash.
 * @param {string} plainPassword - The plain password
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} Match result
 */
async function verifyPassword(plainPassword, hash) {
  // Fix: Validate input types are strings
  if (typeof plainPassword !== 'string' || typeof hash !== 'string') {
    throw new TypeError('Password and hash must be strings');
  }

  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
}

/**
 * Generates a cryptographically secure token.
 * @returns {string} Secure hexadecimal token
 */
function generateSecureToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

module.exports = { getUserById, createUser, verifyPassword, generateSecureToken };
