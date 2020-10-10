const bcrypt = require('bcryptjs')

function makeUsersArray() {
  return [
    { 
      id: 1,
      username: 'Username',
      first_name: 'Firstname',
      last_name: 'Lastname',
      password: 'password'
    },
    {
      id: 2,
      username: 'OneEye',
      first_name: 'Mads',
      last_name: 'Mikkelsen',
      password: 'password'
    },
    {
      id: 3,
      username: 'Dimmy',
      first_name: 'Dim',
      last_name: 'Sum',
      password: 'password'
    },
    {
      id: 4,
      username: 'Alpha',
      first_name: 'Alex',
      last_name: 'Herzon',
      password: 'password'
    },
    { 
      id: 5,
      username: 'Bravo',
      first_name: 'Brad',
      last_name: 'Mercury', 
      password: 'password'
    },
    { 
      id: 6,
      username: 'Charlie',
      first_name: 'Charlotte',
      last_name: 'Stardust', 
      password: 'password'
    },
    {
      id: 7,
      username: 'Delta',
      first_name: 'Denise',
      last_name: 'Smith',
      password: 'password'
    },
  ]
}

function makeWagersArray() {
  return [
    {
      id: 1,
      title: 'Birthdate',
      start_date: '2020-10-03T04:00:00.000Z',
      end_date: null,
      bettor1: 1,
      bettor2: 2
    },
    {
      id: 2,
      title: 'Snowfall',
      start_date: '2020-10-31T04:00:00.000Z',
      end_date: '2020-11-14T05:00:00.000Z',
      bettor1: 2,
      bettor2: 3
    },
    {
      id: 3,
      title: 'New Wager',
      start_date: '2020-10-31T04:00:00.000Z',
      end_date: null,
      bettor1: 4,
      bettor2: 5
    },
    {
      id: 4,
      title: 'Winner of Top Chef',
      start_date: '2020-04-12T04:00:00.000Z',
      end_date: null,
      bettor1: 4,
      bettor2: 6
    },
    {
      id: 5,
      title: 'Next death of Walking Dead',
      start_date: '2020-03-30T04:00:00.000Z',
      end_date: null,
      bettor1: 1,
      bettor2: 6
    },
  ]
}

function makeFriendshipsArray() {
  return [
    {
      id: 1,
      user_id: 1,
      friend_id: 2,
    },
    {
      id: 2,
      user_id: 1,
      friend_id: 3,
    },
    {
      id: 3,
      user_id: 2,
      friend_id: 1,
    },
    {
      id: 4,
      user_id: 2,
      friend_id: 3,
    },
    {
      id: 5,
      user_id: 3,
      friend_id: 1,
    },
    {
      id: 6,
      user_id: 3,
      friend_id: 2,
    },
    {
      id: 7,
      user_id: 4,
      friend_id: 5,
    },
    {
      id: 8,
      user_id: 5,
      friend_id: 4,
    },
    {
      id: 9,
      user_id: 1,
      friend_id: 5,
    },
    {
      id: 10,
      user_id: 5,
      friend_id: 1,
    },
  ]
}

function makeBraggingRightsFixtures() {
  const testUsers = makeUsersArray();
  const testWagers = makeWagersArray();
  const testFriendships = makeFriendshipsArray();
  return { testUsers, testWagers, testFriendships };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
       users,
       wagers,      
       friendships
      ` 
    )
    .then(() => 
      Promise.all([
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE wagers_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE friendships_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
        trx.raw(`SELECT setval('wagers_id_seq', 0)`),
        trx.raw(`SELECT setval('friendships_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    // password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() => {
      const place = users.length -1;
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[place].id]
      )}
    )
}

function seedBragginRightsTables(db, users, wagers, friendships) {
  return db.transaction(async trx => {
    const wagersPlace = wagers.length -1;
    const friendshipsPlace = friendships.length -1;
    await seedUsers(trx, users)
    await trx.into('wagers').insert(wagers)
    await trx.raw(
      `SELECT setval('wagers_id_seq', ?)`,
      [wagers[wagersPlace].id],
    )
    if (friendships.length) {
      await trx.into('friendships').insert(friendships)
      await trx.raw(
        `SELECT setval('friendships_id_seq', ?)`,
        [friendships[friendshipsPlace].id],
      )
    }
  })
}

module.exports = {
  makeUsersArray,
  makeWagersArray,
  makeFriendshipsArray,
  makeBraggingRightsFixtures,
  cleanTables,
  seedUsers,
  seedBragginRightsTables,
}