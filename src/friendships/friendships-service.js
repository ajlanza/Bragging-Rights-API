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