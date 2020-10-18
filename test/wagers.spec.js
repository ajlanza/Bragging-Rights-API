const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Wagers Endpoints', function() {
  let db;
  const testWagers = helpers.makeWagersArray();
  const testUsers = helpers.makeUsersArray();

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

  describe(`Get /api/wagers`, () => {
    context(`Given no wagers`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/wagers')
          .expect(200, [])
      })
    })

    context(`Given there are 'wagers' in the database`, () => {

      beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
      beforeEach('insert wagers', () => {
        
        return db
          .into('wagers')
          .insert(testWagers)
      })
      it('responds with 200 and all of the wagers', () => {
        
        return supertest(app)
          .get('/api/wagers')
          .expect(200, testWagers)
      })
    })
  })
})