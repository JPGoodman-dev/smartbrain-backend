const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const register = require('./controllers/register.js')
const signin = require('./controllers/signin.js')
const image = require('./controllers/image.js')

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'smartbrain'
  }
});


const app = express();

app.use(express.json());
app.use(cors());


/* Map of routes for our API
/ --> res = this is working
/signin --> POST = sucess/fail
/register --> POST = user that was created
/profile/:userId --> GET = user info
/image --> PUT = update ranking on user profile
*/

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date()
    }
  ]
}

app.get('/', (req, res) => {
  res.send(database.users);
})

app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt)})

//dependency injection
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  // let found = false; //this variable changes so we use let
  // database.users.forEach(user => {
  //   if (user.id == id) {
  //     found = true;
  //     return res.json(user); //we need to actually return a response on a match, else even if a match exists, e.g., '/profile/124', a simple if then statement will result in a fail to match because 123 != 124 on the first loop
  //   }
  // })

  // if (!found) {
  //   res.status(400).json('not found');
  // }

  db.select('*').from('users')
    .where({id: id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('error getting user')
      }
    })
    .catch(err => res.json(err));
})

app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(3000, () => {
  console.log('app is running on port 3000');
});
