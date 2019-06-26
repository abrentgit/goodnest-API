'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, required: true },
  password: { type: String, trim: true, required: true },
  role: { type: String, default: 'User', required: true }
});

const authorSchema = mongoose.Schema({
  name: { type: String, required: true }
})

const quotesSchema = mongoose.Schema({
  author: [{ type: mongoose.Schema.Types.ObjectId, ref: "Author" }],
  content: { type: String, required: true }
});

const entrySchema = new mongoose.Schema({
  user: { type: String, required: true },
  date: { type: Date, default: Date.now },
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

authorSchema.methods.serialize = function () {
  return {
    _id: this._id,
    name: this.name,
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
    user: this.user,
    date: this.date,
    content: this.content
  };
};

const Entry = mongoose.model('Entry', entrySchema);
const Author = mongoose.model('Author', authorSchema);
const User = mongoose.model('User', userSchema);
const Quote = mongoose.model('Quote', quotesSchema);

module.exports = { User, Entry, Author, Quote };
