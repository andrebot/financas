const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Validator = require('../helpers/validator');
const { modelConfig } = require('../../config/mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  name:     { type: String, required: true, match: Validator.isNameValid },
  email:    { type: String, required: true, match: Validator.isEmailValid },
  password: { type: String, required: true},
  photo:    { type: String }
});

User.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hash(this.password, modelConfig.HASH_ROUNDS).then((hash) => {
      this.password = hash;

      next();
    }).catch(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('User', User);
