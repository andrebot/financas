const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Establishments = new Schema({
  name: { type: String, required: true, match: Validator.isNameValid }
});

module.exports = mongoose.model('Establishments', Establishments);
