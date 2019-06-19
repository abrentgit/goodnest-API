const express = require('express');
const app = express();
const cors = require('cors');
const { User, Practice, Entry } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const config = require('./config');
const entryRouter = require('./routes/entryRouter');
const router = express.Router();

const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// HOME ROUTE
app.get('/', (req, res) => {
  res.json({ "message": "Welcome to ZeptoBook Product app" });
});

// REGISTER USER

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

  const createAuthToken = function (user) {
    return jwt.sign({ user }, config.JWT_SECRET, {
      subject: user.email,
      audience: user.role,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    });
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

const createAuthToken = function (user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.email,
    audience: user.role,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// LOGIN USER

app.post('/login', (req, res) => {
  User.findOne(
    {
      email: req.body.email
    },
    function (err, user) {
      console.log('error', err);
      console.log('user', user);
      console.log(req.body.email);
      if (err) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      if (!user) {
        res.status(404).json({
          error: 'Invalid credentials'
        });
      } else {
        let validPassword = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!validPassword) {
          res.status(401).json({
            error: 'Invalid credentials'
          });
        } else {
          const authToken = createAuthToken(user.serialize());
          res.status(200).json({
            authToken,
            user_id: user._id
          });
        }
      }
    }
  );
});

app.use('/entries', entryRouter);



//define the root in server
//

// NO VERIFY OF USER YET

// GET ENTRIES

// app.get('/entries', (req, res) => {
//   const perPage = 3;
//   const currentPage = req.query.page || 1;

//   Entry.find()
//     .skip(perPage * currentPage - perPage)
//     .limit(perPage)
//     .then(entries => {
//       res.json({
//         entries: entries.map(entry => entry.serialize())
//       });
//     })
//     .catch(err => {
//       res.status(500).json({
//         message: 'Internal server error'
//       });
//     });
// });

app.post('/entries', (req, res) => {
  const requiredFields = [
    'user',
    'date',
    'mood',
    'hours',
    'practices',
    'content'
  ];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const userId = req.body.user;
  const practices = req.body.practices[0]; // FIX AFTER TESTING

  User.findById(userId, (err, user) => {
    if (err) {
      res.status(422).send({
        message: 'Can not find user'
      });
    } else {
      Practice.find(
        {
          _id: {
            $in: practices
          }
        },
        function (err, practiceData) {
          if (err) {
            console.log(practiceData, 'self-care practices failing');
            res.status(422).send({
              message: 'Can not find practices'
            });
          } else {
            Entry.create({
              user: user._id,
              mood: req.body.mood,
              hours: req.body.hours,
              practices: practices,
              content: req.body.content,
              date: req.body.date
            })

              .then(order => res.status(201).json(order.serialize()))
              .catch(err => {
                console.error(err);
                res.status(500).json({
                  error: 'Something went wrong'
                });
              });
          }
        }
      );
    }
  });
});

// DELETE ENTRY BY ID
app.delete('/entries/:id', (req, res) => {
  Entry.findByIdAndRemove(req.params.id)
    .then(entry => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Internal server error'
    }));
});

// GET ENTRY BY ID

app.get('/entries/:id', (req, res) => {
  Entry.findById(req.params.id)
    .then(order => res.json(order.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went horribly wrong'
      });
    });
});

// PUT ENTRY 

app.put('/entries/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  };

  const updated = {};
  const updateableFields = ['content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Entry.findByIdAndUpdate(req.params.id, updated)
    .then(updatedEntry => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Something went wrong'
    }));
});


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
module.exports = router;

