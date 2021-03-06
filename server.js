const express = require('express');
const app = express();
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/*', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { app };

// let server;

// function runServer(databaseUrl, port = PORT) {
//   return new Promise((resolve, reject) => {
//     mongoose.connect(databaseUrl, err => {
//       if (err) {
//         return reject(err);
//       }
//       server = app
//         .listen(port, () => {
//           console.log(`Your app is listening on port ${port}`);
//           resolve();
//         })
//         .on('error', err => {
//           mongoose.disconnect();
//           reject(err);
//         });
//     });
//   });
// }

// function closeServer() {
//   return mongoose.disconnect().then(() => {
//     return new Promise((resolve, reject) => {
//       console.log('Closing server');
//       server.close(err => {
//         if (err) {
//           return reject(err);
//         }
//         resolve();
//       });
//     });
//   });
// }

// if (require.main === module) {
//   runServer(DATABASE_URL).catch(err => console.error(err));
// }

// module.exports = { runServer, app, closeServer };
