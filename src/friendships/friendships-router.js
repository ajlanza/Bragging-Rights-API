const express = require('express');
const xss = require('xss');
const path = require('path');
const WagersService = require('../wagers/wagers-service');
const FriendshipsService = require('./friendships-service');
const UsersService = require('../users/users-service');
const jwt = require('jsonwebtoken');
const { resolve } = require('url');
const { serializeUser } = require('../users/users-service');

const friendshipsRouter = express.Router();
const jsonParser = express.json();

const serializeFriend = friend => ({
    friend_id: friend.friend_id,
    username: xss(friend.username),
    avatar: xss(friend.avatar),
    pending: friend.pending,
    approved: friend.approved
  })

friendshipsRouter
  .route('/')
  .post(jsonParser,(req, res, next) => {
    const knexInstance = req.app.get('db');
    let { user_id, friend_name } = req.body;
    
    // Check user id was supplied
    if(!user_id) {
      return res
        .status(400)
        .json({ error: { message: `User not supplied.`}})
    }
    // Check friend name was supplied
    if(!friend_name) {
      return res
        .status(400)
        .json({ error: { message: `Friend not selected.` }})
    }
    // Check user exists
    FriendshipsService.getIdByName(knexInstance, friend_name)
      .then(user => {
        if(user === undefined){
          return res
          .status(400)
          .json({ error: { message: `No user with username "${friend_name}"`}})
        }
        else { 
          let friend_id = user.id;
          WagersService.hasUserWithId(knexInstance, user_id)
            .then(hasUserWithId => {
              if(!hasUserWithId)
              return res
                .status(400)
                .json({ error: { message: `User does not exist.`}})
            })
        // If both user and friend are valid users, insert the new friendship into the table
          const initiatorFriendship = {
            user_id,
            friend_id,
            pending: true,
            approved: true,
          }
          let temp_id = user_id;
          user_id = friend_id;
          friend_id = temp_id;
          const receivedFriendship = {
            user_id,
            friend_id,
            pending: true,
            approved: false,
          }
  
          FriendshipsService.insertFriend(knexInstance, initiatorFriendship)
            .then(friend => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/$friend.id`))
                .json(FriendshipsService.serializeFriend(friend))
            })
          FriendshipsService.insertFriend(knexInstance, receivedFriendship)
        }
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let { user_id, friend_id, action } = req.body;
    if(!user_id) {
      return res
        .status(400)
        .json({ error: { message: `User not selected.`}})
    }
    // Check friend name was supplied
    if(!friend_id) {
      return res
        .status(400)
        .json({ error: { message: `Friend not selected.` }})
    }
    // Check both are valid users
    if(isNaN(user_id) || isNaN(friend_id)) {
      return res
        .status(400)
        .json({ error: { message: `Id must be an integer.` }})
    }
    WagersService.hasUserWithId(knexInstance, user_id)
      .then(hasUserWithId => {
        if(!hasUserWithId)
          return res
            .status(400)
            .json({ error: { message: `User does not exist.`}})
       })
    WagersService.hasUserWithId(knexInstance, friend_id)
      .then(hasUserWithId => {
        if(!hasUserWithId)
          return res
            .status(400)
            .json({ error: { message: `Friend does not exist.`}})
       })
    if(action === 'approved') {
      FriendshipsService.approveFriend(knexInstance, user_id, friend_id)
        .then(()=> {
          FriendshipsService.approveFriend(knexInstance, friend_id, user_id)
            .then(() => {
              res
                .status(202)
                .json('Friend approved')
          })
        })
        .catch(next)
      }
    if(action === 'denied') {
      FriendshipsService.denyFriend(knexInstance, user_id, friend_id)
        .then(()=> {
          FriendshipsService.denyFriend(knexInstance, friend_id, user_id)
            .then(() => {
              res
                .status(202)
                .json('Friend denied')
          })
        })
        .catch(next)
    }
  })

friendshipsRouter
  .route('/:user_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    const userId = parseInt(req.params.user_id);
    const userError = UsersService.validateUsers(userId);
    // const tokenId = jwt.decode()

    if(userError) 
      return res
        .status(400)
        .json({ error : {message: userError }})
    
    WagersService.hasUserWithId(knexInstance, userId)
      .then(hasUserWithId => {
        if(!hasUserWithId)
          return res
            .status(400)
            .json({ error: { message: `User does not exist.`}})
      })
    FriendshipsService.getFriendships(knexInstance, userId)
      .then(friends => {
        if(friends.length < 1) {
          res.json({message: 'No friends set up.'})
        }
        else { res.json(friends.map(serializeFriend)) }
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  
module.exports = friendshipsRouter;