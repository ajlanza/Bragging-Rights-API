# Bragging Rights API

API built with Node and Express to utilize a PostgresQL database.
Testing accomplished with Mocha and Chai.  
The api is designed to process users, friends, and wagers.

## Live site:  
https://brag.vercel.app/screen

## Client repo:
https://github.com/ajlanza/Bragging-Rights

## API Endpoints:


### /api/wagers
GET: returns all wagers
* Success 
  * Code: 200
  * Content:  
      [  
        { 
        **id**: integer,
        **title**: "string",
        **start_date**: date,
        **end_date**: null,
        **bettor1**: integer,
        **bettor2**: integer,
        **wager**: "string",
        **wager_status**: "string",
        **winner**: integer,  
        },
        { 
        **id**: integer,
        **title**: "string",
        **start_date**: date,
        **end_date**: null,
        **bettor1**: integer,
        **bettor2**: integer,
        **wager**: "string",
        **wager_status**: "string",
        **winner**: integer,  
        }
      ]

POST: adds new wager
Required in body:
 { 
 **title**: "string",
 **bettor1**: integer,
 **bettor2**: integer,
 **wager_status**: "string"
 }
 
* Success
  * Code: 201
  * Content:
      { 
        **id**: integer,
        **title**: "string",
        **start_date**: date,
        **end_date**: null,
        **bettor1**: integer,
        **bettor2**: integer,
        **wager**: "string",
        **wager_status**: "string",
        **winner**: integer,  
      }
* Error
  * Code: 40X
  * Content: 
    { error: { message: "Error message string." } }

PATCH: updates wager with wager id provided
Required in body:
  {
    **type**: "string", one of two values: "approval" or "winner"
    **wager_id**: 2
    **wager_status** "string", only required if type is "approval"
    **winner** only required if type is "winner"
  }
* Success
  * Code: 202

### /api/wagers/:wager_id
GET: returns wager with wager id provided
* Success 
  * Code: 200
  * Content:  
      { 
        **id**: integer,
        **title**: "string",
        **start_date**: date,
        **end_date**: null,
        **bettor1**: integer,
        **bettor2**: integer,
        **wager**: "string",
        **wager_status**: "string",
        **winner**: integer,  
      }
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }
   
### /api/myWagers/:user_id
GET: returns all wagers containing supplied user id
* Success 
  * Code: 200
  * Content:  
      [  
        { 
          **id**: integer,
          **title**: "string",
          **start_date**: date,
          **end_date**: null,
          **bettor1**: integer,
          **bettor2**: integer,
          **wager**: "string",
          **wager_status**: "string",
          **winner**: integer,  
        },
        { 
          **id**: integer,
          **title**: "string",
          **start_date**: date,
          **end_date**: null,
          **bettor1**: integer,
          **bettor2**: integer,
          **wager**: "string",
          **wager_status**: "string",
          **winner**: integer,  
        }  
      ]
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }

### /api/friends
POST: add friend request
Required in body:
  {  
    **user_id**: integer,
    **friend_name**: "string,
  }
* Success
  * Code: 201
  * Content
    {
      **user_id**: integer
      **friend_id**: integer
      **avatar**: "string"
    }
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }

PATCH: updates friendship status to approved or denied
Required in body:
  {
    **user_id**: integer
    **friend_id**: integer
    **action**: "string" one of two values: "approved" or "denied"
  }
* Success
  * Code: 202
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }

### /api/friends:user_id
GET: returns friends of user when given their id
* Success 
  * Code: 200
  * Con
  [ 
    {
      **friend_id**: 2,
      **username**: "string"
      **avatar**: "string"
      **pending**: boolean
      **approved**: boolean
    },
    {
      **friend_id**: 2,
      **username**: "string"
      **avatar**: "string"
      **pending**: boolean
      **approved**: boolean
    }
  ]
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }

### /api/auth/login
POST: returns authroken on successful login
Required in body:
  {  
    **username**: "string",
    **password**: "string",
  }
* Success
  * Code: 200
  * Content: 
  {
    **authToken**: "string"
  }
    
* Error
  * Code: 40X
  * Content:  
  { error: "Error message string." }

### /api/users
POST: create a new user

Required in body:
 { 
 **username**: "string",
 **password**: "string",
 }
 
* Success 
  * Code: 201
  * Content:  
  {
    **id**: integer,
    **username**: "string",
    **first_name**: "string",
    **last_name**: "string"
    **avatar**: "string"
  }
* Error
  * Code: 40X
  * Content:  
  { error: { message: "Error message string." } }