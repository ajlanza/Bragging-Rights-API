const express = require('express');
const AuthService = require('./auth-service');


const authRouter = express.Router()
const jsonParser = express.json()

authRouter
  .route('/test')
  .get((req, res, next) => {
    res.send('Auth get /test route')
  })

authRouter
  .post('/login', jsonParser, (req, res, next) => {
      const{ username, password } = req.body
      const loginUser = { username, password }

      for (const [key, value] of Object.entries(loginUser))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          })
      AuthService.getUserWithUserName(
        req.app.get('db'),
        loginUser.username
      )
        .then(dbUser => {
          if (!dbUser)
            return res.status(400).json({
              error: `Incorrect username or password`,
            })

          return AuthService.comparePasswords(loginUser.password, dbUser.password)
            .then(compareMatch => {
              if (!compareMatch)
                return res.status(400).json({
                  error: `Incorrect username or password`,
                })
                
                const sub = dbUser.username
                const payload = { 
                  user_id: dbUser.id,
                  avatar: dbUser.avatar,
                  total_losses: dbUser.total_losses,
                  total_wins: dbUser.total_wins,
                }

                res.send({
                  authToken: AuthService.createJwt(sub, payload),
                })
            })
        })
        .catch(next)
  })

  module.exports = authRouter