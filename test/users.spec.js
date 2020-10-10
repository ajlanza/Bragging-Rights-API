const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe(`Users endpoint`, function() {
  let db;
  const testUsers = helpers.makeUsersArray();

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
})