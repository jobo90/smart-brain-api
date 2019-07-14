const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;

  // If either email or password are empty, return 400 error
  if (!email || !password) {
    return res.status(400).json('Incorrect form submission');
  }

  // Selecting the email and hash from the login table
  db.select('email', 'hash')
    .where('email', '=', email)
    .from('login')
    .then(data => {
      // Using bcrypt to compare the password with the hash in the table
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json('Unable to get user'));
      } else {
        res.status(400).json('Wrong credentials');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials'));
};

module.exports = {
  handleSignin
};
