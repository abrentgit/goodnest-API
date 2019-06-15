const express = require('express');
const app = express();
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { DATABASE_URL, PORT } = require('./config');
const registerRouter = require('./register-router');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(express.json());

// app.use('/register', registerRouter);

app.post('/register', (req, res) => {
  const requiredFields = ['name', 'password', 'email'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const createAuthToken = function(user) {
    return jwt.sign(
      { user },
      {
        subject: user.email,
        audience: user.role,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
      }
    );
  };

  let hashed = bcrypt.hashSync(req.body.password, saltRounds);

  User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashed
  })
    .then(user => {
      const authToken = createAuthToken(user.serialize());
      res.status(201).json({
        authToken
      });
    })
    .catch(err => {
      console.log(err);
      res.status(422).json({
        message: 'Something went wrong'
      });
    });
});

// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// module.exports = { app };

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
