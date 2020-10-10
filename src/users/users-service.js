const bcrypt = require('bcryptjs');
const xss = require('xss');

const UsersService = {
  validateUsers(userId) {
    if(isNaN(userId)) {
      return 'Id must be an integer.'
    }
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (password.length > 72) {
      return 'Password can not be greater than 72 characters.'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password can not start or end with empty spaces.'
    }
    return null
  },
  hasUserWithUsername(knex, username) {
    return knex
      .from('users')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      password: user.password
    }
  },

  getAllUsers(knex) {
    return knex.select('*').from('users')
  },
  getUserById(knex, userId) {
    return knex
      .from('users')
      .select('*')
      .where('id', userId)
      .first()
  }
}

module.exports = UsersService;