'use strict';

// CORS

var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());

app.get('/', function (req, res, next) {
  res.json({ msg: 'This is CORS-enabled for all origins!' });
});

app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80');
});

// CONFIG

exports.DATABASE_URL =
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  'mongodb://localhost:27017/Goodnest';

exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/Goodnest-api';
exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'sugarlandmalibu19';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
