const xss = require('xss');

const FriendshipsService = {
  getFriendships(knex, userId) {
    return knex
      .select('*')
      .from('users')
      .innerJoin('friendships', 'users.id', 'friendships.friend_id')
      .where('user_id', userId)
  },
  insertFriend(knex, newFriendship) {
    return knex
      .insert(newFriendship)
      .into('friendships')
      .returning('*')
      .then(([friend]) => friend)
  },
  approveFriend(knex, user_id, friend_id) {
    return knex('friendships')
      .where('user_id', user_id)
      .andWhere('friend_id', friend_id)
      .update({
        pending: false,
        approved: true
      })
      // .then(([friendship]) => friendship)
  },
  addWin(knex, winner_id, loser_id) {
    return knex('friendships')
      .where('user_id', winner_id)
      .andWhere('friend_id', loser_id)
      .update({
         win: knex.raw('?? + 1', ['win'])
      })
  },
  addLoss(knex, winner_id, loser_id) {
    return knex('friendships')
      .where('user_id', loser_id)
      .andWhere('friend_id', winner_id)
      .update({
        loss: knex.raw('?? + 1', ['loss'])
    })
  },
  denyFriend(knex, user_id, friend_id) {
    return knex('friendships')
      .where('user_id', user_id)
      .andWhere('friend_id', friend_id)
      .update({
        pending: false,
        approved: false
      })
      // .then(([friendship]) => friendship)
  },
  hasUserWithName(knex, username) {
    return knex
      .from('users')
      .where({ username })
      .first()
      .then(username => !!username)
  },
  getIdByName(knex, username) {
    return knex
      .from('users')
      .where('username', username)
      .first()
  },
  serializeFriend(friend) {
    return {
      user_id: xss(friend.user_id),
      friend_id: xss(friend.friend_id),
      avatar: xss(friend.avatar)
    }
  }
}

module.exports = FriendshipsService;