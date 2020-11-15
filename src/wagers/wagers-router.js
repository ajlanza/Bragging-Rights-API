const express = require('express');
const path = require('path');
const WagersService = require('./wagers-service');
const UsersService = require('../users/users-service');
const { hasUserWithId } = require('./wagers-service');
const FriendshipsService = require('../friendships/friendships-service');

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
    const {title, start_date, end_date, bettor1, bettor2, wager_status } = req.body
    let { wager } = req.body
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
    if(!wager){
      wager = 'Bragging Rights'
    }
    if(!wager_status){
      return res
        .status(400)
        .json({ error: {message: `Wager status not provided.`}})
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
      wager,
      wager_status
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
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let { type, wager_id, wager_status, winner_id, loser_id } = req.body;
    if(!type)
      return res
        .status(400)
        .json({ error: { message: `Type of patch not indicated.`}})
    if(!wager_id) {
      return res
        .status(400)
        .json({ error: { message: `Wager not selected.`}})
    }
    if(isNaN(wager_id)) {
      return res
        .status(400)
        .json({ error: { message: `Wager id invalid.`}})
    }
    if(type === 'approval' && !wager_status) {
      return res
        .status(400)
        .json({ error: { message: `Wager status not provdied.`}})
    }
    if(type === 'winner' && !winner_id) {
      return res
        .status(400)
        .json({ error: { message: `Winner not provided.`}})
    }
    if(type === 'approval') {
      WagersService.approveWager(knexInstance, wager_id, wager_status)
        .then(() => (
          res
            .status(202)
            .json('Wager approved.')
        ))
        .catch(next)
    }
    if(type === 'winner') {
      WagersService.assignWinner(knexInstance, wager_id, winner_id, 'past')
        .then(() => {
          UsersService.addTotalWin(knexInstance, winner_id)
          .then(() => {
            UsersService.addTotalLoss(knexInstance, loser_id)
            .then(() => {
              FriendshipsService.addWin(knexInstance, winner_id, loser_id)
                .then(() => {
                  FriendshipsService.addLoss(knexInstance, winner_id, loser_id)
                    .then(() => {
                      res
                        .status(202)
                        .json('Winner approved.')
                    })
                })
            })
          })
        })
        .catch(next)
    }
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