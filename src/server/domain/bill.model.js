const mongoose = require('mongoose');
const Validator = require('../helpers/validator');
const Schema = mongoose.Schema;

const Bill = new Schema({
  name:        { type: String, required: true, validate: Validator.isNameValid },
  type:        { type: String, required: true, validate: Validator.isNameValid },
  bank:        { type: String, required: true, validate: Validator.isNameValid },
  description: { type: String, validate: Validator.isNameValid },
  value:       { type: Number, require: true },
  dueDay:      { type: Number, required: true },
  startedAt:   { type: Date, required: true },
  paidAt:      [ { type: Date } ],
  isProgramed: { type: Boolean, default: false },
  repeat: {
    type:      { type: String, require: true, validate: Validator.isTimeRepeatingValue },
    weekDays:  [ { type: String, validate: Validator.isWeekDay } ],
    times:     { type: Number },
    until:     { type: Date }
  }
});

module.exports = mongoose.model('Bill', Bill);
