const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;

  // If email, name or password are empty, send back a 400 response
  if (!email || !name || !password) {
    return res.status(400).json('Incorrect form submission');
  }
  
  const hash = bcrypt.hashSync(password);

  // Transaction makes sure that all operations are getting done or if one fails, both are not being applied
  // Like that we have the user in the user but also in the login table
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
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json('Unable to register'));
};

module.exports = {
  handleRegister
};
