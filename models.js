'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, required: true },
  password: { type: String, trim: true, required: true },
  role: { type: String, default: 'User', required: true }
});

const practiceSchema = mongoose.Schema({
  name: { type: String, required: true }
});

const entrySchema = new mongoose.Schema({
  user: { type: String, required: true },
  mood: { type: String, required: true },
  hours: { type: String, required: true },
  practices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practice' }],
  content: { type: String },
  date: { type: Date, default: Date.now }
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

entrySchema.methods.serialize = function () {
  return {
    _id: this._id,
    user: this.user,
    mood: this.mood,
    hours: this.hours,
    practices: this.practices,
    content: this.content,
    date: this.date
  };
};

practiceSchema.methods.serialize = function () {
  return {
    _id: this._id,
    name: this.name
  };
};

const Entry = mongoose.model('Entry', entrySchema);
const Practice = mongoose.model('Practice', practiceSchema);
const User = mongoose.model('User', userSchema);

module.exports = { User, Entry, Practice };
