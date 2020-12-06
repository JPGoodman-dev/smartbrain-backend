//Use a transaction/commit/rollback if multiple SQL operations need to be performed at once; e.g., registering a user means storing a user profile to one table and storing the user's password in a separate table.

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if(!email || !name || !password) {
    return res.status(400).json('incorrect form submission')
  }
  const hash = bcrypt.hashSync(password)

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
        email: loginEmail[0],
        name: name,
        joined: new Date()
        })
        .then(user => {
          res.json(user[0]); //http must send a response or app will hang waiting for server response. user is an array of JSON objects
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
  handleRegister: handleRegister
}
