const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const CreditCard = new Schema({
  number:  { type: String, required: true, validate: Validator.isCreditCardNumber },
  flag:    { type: String, required: true, validate: Validator.isNameValid },
  bank:    { type: String, required: true, validate: Validator.isNameValid },
  dueDate: { type: Date, required: true }
});

module.exports = mongoose.model('CreditCard', CreditCard);
