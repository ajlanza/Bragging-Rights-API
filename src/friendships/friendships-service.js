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
  hasUserWithName(knex, username) {
    return knex
      .from('users')
      .where({ username })
      .first()
      .then(username => !!username)
  },
  getIdByName(knex, username) {
    console.log('in getIdByName and username is ', username)
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