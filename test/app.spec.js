const app = require('../src/app')

describe('App', () => {
  it(`GET / responds with 200 'ok:true'`, () => {
    const test = {ok: true}
    return supertest(app)
      .get('/')
      .expect(200, test)
  })
})