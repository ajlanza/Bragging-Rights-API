const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe(`Users endpoint`, function() {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'))

  describe(`Get /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, [])
      })
    })

    context(`Given there are 'users' in the database`, () => {
      beforeEach('insert users', () => 
        helpers.seedUsers(
          db,
          testUsers
        )
      )
      it('responds with 200 and all of the users', () => {
        
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers)
      })
    })
  })

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers,
        )
      )

      const requiredFields = ['username', 'password']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'test username',
          password: 'test password',
        }
    
        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body.`,
            })
        })
      })

      it(`responds 400 'Password must be longer than 8 characters.' when empty password`, () => {
        const userShortPassword = {
          username: 'test username',
          password: '1234567',
        }
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: `Password must be at least 8 characters.` })
      })

      it(`responds 400 'Password can not be greater than 72 characters.' when long password`, () => {
        const userLongPassword = { 
          username: 'test username',
          password: '*'.repeat(73),
        }
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: `Password can not be greater than 72 characters.` })
      })

      it(`responds with 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          username: 'test username',
          password: ' 1Aa!2Bb@',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, {error : `Password can not start or end with empty spaces.` })
      })

      it(`responds with 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = { 
          username: 'test username',
          password: '1Aa!2Bb@ ',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: `Password can not start or end with empty spaces.`})
      })

      it(`responds 400 'User name already taken' when username isn't unique`, () => {
        const duplicateUer = {
          username: testUser.username,
          password: '11AAaa!!',
        }
        return supertest(app)
          .post('/api/users')
          .send(duplicateUer)
          .expect(400, { error: `Username already taken, please select a different one.` })
      })
    })
  })
})