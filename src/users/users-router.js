const express = require('express');
const xss = require('xss');
const path = require('path');
const UsersService = require('./users-service');


const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter 
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(user => UsersService.serializeUser(user)))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const {username, password } = req.body
    const knexInstance = req.app.get('db');
    for (const field of ['username', 'password'])
      if(!req.body[field])
        return res
          .status(400)
          .json({ error: `Missing '${field}' in request body.`
        })

      const passwordError = UsersService.validatePassword(password)

      if(passwordError)
        return res
          .status(400)
          .json({ error: passwordError })

        UsersService.hasUserWithUsername(
          knexInstance,
          username
        ) 
          .then(hasUserWithUsername => {
            if(hasUserWithUsername)
              return res
                .status(400)
                .json({ error : `Username already taken, please select a different one.` })

            return UsersService.hashPassword(password)
              .then(hashedPassword => {
                const newUser = {
                  username,
                  password: hashedPassword,
                }
                return UsersService.insertUser(
                  knexInstance,
                  newUser
                )
                  .then(user => {
                    res
                      .status(201)
                      .location(path.posix.join(req.originalUrl, `/${user.id}`))
                      .json(UsersService.serializeUser(user))
                  })
              })
          }) 
          .catch(next)
  })

usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    const userId = parseInt(req.params.user_id);
    const userError = UsersService.validateUsers(userId);

    if(userError) 
      return res
        .status(400)
        .json({ error : {message: userError }})

    UsersService.getUserById(knexInstance, userId)
    .then(user => {
      if(!user) {
        return res
          .status(400)
          .json({ error: { message: 'User does not exist.' }})
      }
      res.user = user;
      next();
    })
    .catch(next);
  })
  .get((req, res, next) => {
    res.json(UsersService.serializeUser(res.user))
  })

module.exports = usersRouter;
