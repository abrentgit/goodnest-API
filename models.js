'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, required: true },
  password: { type: String, trim: true, required: true },
  role: { type: String, default: 'User', required: true }
});

const quotesSchema = mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true }
});

const entrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

userSchema.methods.serialize = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    password: this.password,
    role: this.role
  };
};

quotesSchema.methods.serialize = function () {
  return {
    _id: this._id,
    author: this.author,
    content: this.content
  };
};

entrySchema.methods.serialize = function () {
  return {
    _id: this._id,
    title: this.title,
    date: this.date,
    content: this.content
  };
};

const Entry = mongoose.model('Entry', entrySchema);
const User = mongoose.model('User', userSchema);
const Quote = mongoose.model('Quote', quotesSchema);

module.exports = { User, Entry, Quote };
