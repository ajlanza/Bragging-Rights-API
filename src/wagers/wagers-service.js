const xss = require('xss');

const WagersService = {
  validateWagers(wagerId) {
    if(isNaN(wagerId)) {
      return 'Id must be an integer.'
    }
    return null
  },
  getAllWagers(knex) {
    return knex.select('*').from('wagers')
  },
  getWagerById(knex, wagerId) {
    return knex
      .from('wagers')
      .select('*')
      .where('id', wagerId)
      .first()
  },
  insertWager(knex, newWager) {
    return knex
      .insert(newWager)
      .into('wagers')
      .returning('*')
      .then(([wager]) => wager)
  },
  hasUserWithId(knex, id) {
    return knex
      .from('users')
      .where({ id })
      .first()
      .then(id => !!id)
  },
  approveWager(knex, id, wager_status) {
    return knex('wagers')
      .where({ id })
      .update({ wager_status })
  },
  assignWinner(knex, id, winner, wager_status) {
    return knex('wagers')
      .where({ id })
      .update({ winner, wager_status })
  },
  serializeWager(wager) {
    return {
      id: wager.id,
      title: xss(wager.title),
      start_date: wager.start_date,
      end_date: wager.end_date,
      bettor1: wager.bettor1,
      bettor2: wager.bettor2,
      wager: xss(wager.wager),
      wager_status: xss(wager.wager_status),
      winner: wager.winner
    }
  }
}

module.exports = WagersService;