'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const mongoose = require('mongoose');
const expect = require('chai').expect;
const faker = require('faker');

const { TEST_DATABASE_URL } = require('../config');
const { app, runServer, closeServer } = require('../server');
const { User, Practice, Entry } = require('../models');

chai.use(chaiHttp);

let userId, newToken;

// let newUser = new User({
//   name: 'fake',
//   email: 'fake@test.com',
//   password: 'password'
// });

// let newEntry = {
//   user: userId,
//   date: Date.now(),
//   mood: 'Awesome',
//   hours: '8-12',
//   practices: practiceIds,
//   content: 'I feel awesome. I am finding peace today'
// };

function seedPracticeData() {
  console.log('seeding practices data');
  const seedData = [];

  for (let i = 0; i <= 1; i++) {
    seedData.push(generateParacticeData());
  }
  return Practices.insertMany(seedData);
}

function generateParacticeData() {
  return {
    name: faker.random.words()
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Goodnest API', () => {
  before(function() {
    runServer(TEST_DATABASE_URL);
  });

  before(function() {
    seedPracticeData();
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

it('should /POST entry', function(done) {
  chai
    .request(app)
    .post('/orders')
    .send(newEntry)
    .set('Authorization', 'Bearer ' + newToken)
    .end(function(err, res) {
      expect(res).to.have.status(201);
      entryId = res.body._id;
      done();
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
