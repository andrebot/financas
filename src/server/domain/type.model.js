const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Type = new Schema({
  name: { type: String, required: true, match: Validator.isNameValid }
});

module.exports = mongoose.model('Type', Type);
