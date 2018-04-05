const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Transaction = new Schema({
  name:        { type: String, required: true, validate: Validator.isNameValid },
  from:        { type: String, required: true, validate: Validator.isNameValid },
  to:          { type: String, required: true, validate: Validator.isNameValid },
  costCenter:  { type: String, required: true, validate: Validator.isNameValid },
  type:        { type: String, required: true, validate: Validator.isNameValid },
  description: { type: String, validate: Validator.isLargeTextValid },
  creditCard:  { type: Schema.ObjectId, ref: 'CreditCard' },
  value:       { type: Number, required: true },
  date:        { type: Date, required: true },
});

module.exports = mongoose.model('Transaction', Transaction);
