const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Bill = new Schema({
  name:        { type: String, required: true, match: Validator.isNameValid },
  type:        { type: String, required: true, match: Validator.isNameValid },
  bank:        { type: String, required: true, match: Validator.isNameValid },
  description: { type: String, match: Validator.isNameValid },
  payed:       { type: Boolean, default: false },
  value:       { type: Number, require: true },
  dueDate:     { type: Date, required: true },
  payedAt:     { type: Date },
  isProgramed: { type: Boolean, default: false },
  repeat: {
    type:     { type: String, require: true, match: Validator.isTimeRepeatingValue },
    weekDays: [ { type: String, match: Validator.isWeekDay } ],
    times:    { type: Number },
    until:    { type: Date }
  }
});

module.exports = mongoose.model('Bill', Bill);
