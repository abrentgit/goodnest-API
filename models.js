'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, trim: true, required: true },
  role: { type: String, default: 'User', required: true }
});

const entrySchema = new mongoose.Schema({
  author: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, default: Date.now },
  mood: { type: String, required: true },
  hours: { type: Number, required: true },
  practices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practice' }],
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal' }
});

const journalSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
});

const practiceSchema = mongoose.Schema({
  practice: { type: String, required: true }
});

userSchema.methods.serialize = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    password: this.password
  };
};

entrySchema.methods.serialize = function() {
  return {
    _id: this._id,
    author: this.author,
    date: this.date,
    mood: this.mood,
    hours: this.hours,
    practices: this.practices,
    content: this.content
  };
};

journalSchema.methods.serialize = function() {
  return {
    _id: this._id,
    title: this.title,
    content: this.content
  };
};

practiceSchema.methods.serialize = function() {
  return {
    _id: this._id,
    practice: this.description
  };
};

const Entry = mongoose.model('Entry', entrySchema);
const Practice = mongoose.model('Practice', practiceSchema);
const Journal = mongoose.model('Journal', journalSchema);
const User = mongoose.model('User', userSchema);

module.exports = { User, Entry, Practice, Journal };
