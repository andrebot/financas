const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Transaction = new Schema({
  name:        { type: String, required: true, match: Validator.isNameValid },
  from:        { type: String, required: true, match: Validator.isNameValid },
  to:          { type: String, required: true, match: Validator.isNameValid },
  costCenter:  { type: String, required: true, match: Validator.isNameValid },
  type:        { type: String, required: true, match: Validator.isNameValid },
  description: { type: String, match: Validator.isLargeTextValid },
  creditCard:  { type: Schema.ObjectId, ref: 'CreditCard' },
  value:       { type: Number, required: true },
  date:        { type: Date, required: true },
});

module.exports = mongoose.model('Transaction', Transaction);
