const crypto = require('crypto');
const { validateProfile } = require('../utils/profileValidation');

const users = [];

function createUser({ email, spotifyId = null }) {
  const validation = validateProfile({ email, spotifyId });

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const existingUser = getUserByEmail(email);

  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  const user = {
    userId: crypto.randomUUID(),
    email,
    spotifyId,
  };

  users.push(user);

  return user;
}

function getUserById(userId) {
  if (!userId) {
    return null;
  }

  return users.find((user) => user.userId === userId) || null;
}

function getUserByEmail(email) {
  if (!email) {
    return null;
  }

  return users.find((user) => user.email === email) || null;
}

function getAllUsers() {
  return users;
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
};