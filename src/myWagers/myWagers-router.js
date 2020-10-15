const express = require('express');
const UsersService = require('../users/users-service');
const MyWagersService = require('./myWagers-service');
const WagersService = require('../wagers/wagers-service')

const myWagersRouter = express.Router();
const jsonParser = express.json();

myWagersRouter
  .route('/:user_id')
  .get((req, res, next) => {
    const user_id  = parseInt(req.params.user_id);
    // Check if id is valid before proceeding.
    const userError = UsersService.validateUsers(user_id);
    if(userError){
      return res
        .status(400)
        .json({ error: { message: userError}})
    }
    const knexInstance = req.app.get('db');
    // Check that user exists
    MyWagersService.isValidUser(knexInstance, user_id)
      .then(user => {
        // Send error message if user doesn't exist
        if(!user) {
          return res.send(`Not a valid user.`)
        }
        // Get wagers if user does exist
        MyWagersService.getUserWagers(knexInstance, user_id)
          .then(wagers => {
             if(wagers.length === 0) {
               return res.send({error: { message: 'No wagers yet.'}})
             }
             res.json(wagers.map(wager => WagersService.serializeWager(wager)));
             next();
          })
          .catch(next);
        })
        .catch(next);
    })

module.exports = myWagersRouter;