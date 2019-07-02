const express = require('express');
const app = express();
const cors = require('cors');
const router = express.Router();
const morgan = require('morgan');
const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const registerRouter = require('./routes/registerRouter');
const entryRouter = require('./routes/entryRouter');
const loginRouter = require('./routes/loginRouter');
const quotesRouter = require('./routes/quotesRouter');

app.use(morgan('combined'));
app.use(express.json());

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/entries', entryRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/quotes', quotesRouter);

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

