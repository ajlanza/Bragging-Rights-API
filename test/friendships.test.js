const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Friendships Endpoints', function() {
  let db;
  const { testFriendships, testUsers, testWagers } = helpers.makeBraggingRightsFixtures();
  

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/friends/:id`, () => {
    context(`Given no friendships`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
      it(`responds with 200 and message`, () => {
        return supertest(app)
          .get('/api/friends/1')
          .expect(200, {message: 'No friends set up.'})
      })
    })

    context(`Given the user has friends in the database`, () => {

      beforeEach('seed tables', () => helpers.seedBragginRightsTables(db, testUsers, testWagers, testFriendships))
   
      it('responds with 200 and all friends', () => {
        let userId = 2
        let expectedResult = [
          {
            friend_id: 1,
            username: 'Username',
            avatar: 'club.png',
            pending: false,
            approved: true
          },
          {
            friend_id: 3,
            username: 'Dimmy',
            avatar: 'club.png',
            pending: true,
            approved: true
          }
        ]
        return supertest(app)
          .get(`/api/friends/${userId}`)
          .expect(200, expectedResult)
      })
    })
  })
  describe(`POST /api/friends`, () => {
    context(`Given no friend_name`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
      it(`responds with 400 and error message`, () => {
        const userNoFriend =
          { user_id:  1 }
        return supertest(app)
          .post(`/api/friends`)
          .send(userNoFriend)
          .expect(400, {error : {message : `Friend not selected.`}})
      })
    })
    context(`Given no user_id`, () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        it(`responds with 400 and error message`, () => {
          const noUserId =
            { friend_name: 'Mario' }
          return supertest(app)
            .post(`/api/friends`)
            .send(noUserId)
            .expect(400, {error : {message : `User not supplied.`}})
        })
      })
      context(`Given invalid user id`, () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        it(`responds with 201 and error message`, () => {
          const validFriendship =
            { 
                user_id: 400,
                friend_name: "OneEye" 
            }
          return supertest(app)
            .post(`/api/friends`)
            .send(validFriendship)
            .expect(400, {error: {message: `User does not exist.`}})
        })
      })
      context(`Given invalid friend name`, () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        it(`responds with 201 and error message`, () => {
          const validFriendship =
            { 
                user_id: 1,
                friend_name: "Invalid" 
            }
          return supertest(app)
            .post(`/api/friends`)
            .send(validFriendship)
            .expect(400, {error: {message: `No user with username "${validFriendship.friend_name}"`}})
        })
      })
      context(`Happy path`, () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        it(`responds with 201 and error message`, () => {
          const validFriendship =
            { 
                user_id: 1,
                friend_name: "OneEye" 
            }
          return supertest(app)
            .post(`/api/friends`)
            .send(validFriendship)
            .expect(201)
        })
      })
    
    
  })
})