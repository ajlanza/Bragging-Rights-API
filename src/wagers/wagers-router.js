const express = require('express');
const path = require('path');
const WagersService = require('./wagers-service');
const UsersService = require('../users/users-service');
const { hasUserWithId } = require('./wagers-service');

const wagersRouter = express.Router();
const jsonParser = express.json();

wagersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    WagersService.getAllWagers(knexInstance)
      .then(wagers => {
        res.json(wagers.map(wager => WagersService.serializeWager(wager)))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const {title, start_date, end_date, bettor1, bettor2, wager } = req.body
    if(!title){
      return res
        .status(400)
        .json({ error: { message: `Title is necessary.` }})
    }
    // Check if bettor1 and bettor2 are assigned values
    if(!bettor1){
      return res
        .status(400)
        .json({ error: { message: `Bettor1 not valid.` }})
    }
    if(!bettor2){
      return res
        .status(400)
        .json({ error: { message: `Bettor2 not valid.` }})
    }
    // Check that both bettor1 and bettor2 are valid users.
    WagersService.hasUserWithId(knexInstance, bettor1)
      .then(hasUserWithId => {
        if(!hasUserWithId)
          return res
            .status(400)
            .json({ error: { message: `Bettor1 does not exist.` }})
      })
    WagersService.hasUserWithId(knexInstance, bettor2)
      .then(hasUserWithId => {
        if(!hasUserWithId)
          return res
            .status(400)
            .json({ error: { message: `Bettor2 does not exist.` }})
      })
    // If bettor1 and bettor2 are valid users create the new wager
    const newWager = {
      title,
      start_date,
      end_date,
      bettor1,
      bettor2,
      wager
    }
    // Add the new wager to the wagers table
    WagersService.insertWager(knexInstance, newWager)
      .then(wager => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${wager.id}`))
          .json(WagersService.serializeWager(wager))
      })
      .catch(next)
  })

wagersRouter
  .route('/:wager_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    const wagerId = parseInt(req.params.wager_id);
    const wagerError = WagersService.validateWagers(wagerId);
    
    if(wagerError)
      return res
        .status(400)
        .json({ error: { message: wagerError}})

    WagersService.getWagerById(knexInstance, wagerId)
    .then(wager => {
      if(!wager) {
        return res
          .status(404)
          .json({ error: { message: 'Wager does not exist.' }})
      }
      res.wager = wager;
      next();
    })
    .catch(next);
  })
  .get((req, res, next) => {
    res.json(WagersService.serializeWager(res.wager))
  })

  module.exports = wagersRouter;