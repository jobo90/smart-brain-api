const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('Incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    console.log('Here 1')
    trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        console.log('Here 2')
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
            console.log('Here 3')
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json('Unable to register'));
};

module.exports = {
  handleRegister
};
