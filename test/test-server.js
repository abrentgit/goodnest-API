'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const mongoose = require('mongoose');
const faker = require('faker');
const expect = require('chai').expect;

const { TEST_DATABASE_URL } = require('../config');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../models');

chai.use(chaiHttp);

let userId, newToken;

let newUser = new User({
  name: 'fake',
  email: 'fake@test.com',
  password: 'password'
});

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Order Inn API', () => {
  before(function() {
    runServer(TEST_DATABASE_URL);
  });

  before(function() {
    seedDishData();
  });

  before(function(done) {
    chai
      .request(app)
      .post('/register')
      .send(newUser)
      .end(function(err, res) {
        newToken = res.body.authToken;
        done();
      });
  });

  after(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  it('should login', function(done) {
    chai
      .request(app)
      .post('/login')
      .send({
        email: newUser.email,
        password: newUser.password
      })
      .end(function(err, res) {
        userId = res.body.user_id;
        expect(res).to.have.status(200);
        done();
      });
  });
});

// describe('index page', function () {
// 	it('should exist', function () {
// 		return chai.request(app)
// 			.get('/')
// 			.then(function (res) {
// 				expect(res).to.have.status(200);
// 			});
// 	});
// });
