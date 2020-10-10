const MyWagersService = {
  isValidUser(knex, userId) {
    return knex
      .from('users')
      .select('*')
      .where('id', userId)
      .first()
  },
  getUserWagers(knex, userId) {
    return knex
      .from('wagers')
      .select('*')
      .where('bettor1', userId)
      .orWhere('bettor2', userId)
  }
}

module.exports = MyWagersService;