const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('myWagers Endpoints', function() {
  let db;
  const { testWagers, testUsers } = helpers.makeBraggingRightsFixtures();
  

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

  describe(`GET /api/myWagers/:id`, () => {
    context(`Given no user wagers`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
      it(`responds with an error message`, () => {
        return supertest(app)
          .get('/api/myWagers/1')
          .expect(200, {error: {message: 'No wagers yet.'}})
      })
    })

    context(`Given there are 'wagers' in the database`, () => {

      beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
      beforeEach('insert wagers', () => {
        
        return db
          .into('wagers')
          .insert(testWagers)
      })
      it('responds with 200 and all of the users wagers', () => {
        let userId = 2;
        expectedResult = [
            {
              id: 1,
              title: 'Birthdate',
              start_date: '2020-10-03T04:00:00.000Z',
              end_date: null,
              bettor1: 1,
              bettor2: 2,
              wager: 'Bragging Rights',
              wager_status: 'approved'
            },
            {
              id: 2,
              title: 'Snowfall',
              start_date: '2020-10-31T04:00:00.000Z',
              end_date: '2020-11-14T05:00:00.000Z',
              bettor1: 2,
              bettor2: 3,
              wager: 'Bragging Rights',
              wager_status: 'pending bettor2'
            }
          ]
        return supertest(app)
          .get(`/api/myWagers/${userId}`)
          .expect(200, expectedResult)
      })
    })
  })
})