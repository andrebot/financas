const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const CostCenter = new Schema({
  name: { type: String, required: true, validate: Validator.isNameValid }
});

module.exports = mongoose.model('CostCenter', CostCenter);
