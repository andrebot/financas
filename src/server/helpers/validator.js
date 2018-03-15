
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const largeTextRegExp = /^[a-zA-Z0-9\u00C0-\u00FF\-\_\\\s\.\,\#\!\*\+\:\;\@\(\)\&\'\?\"\$\%]*$/;
const nameRegExp = /^[a-zA-Z0-9\u00C0-\u00FF\-\s]*$/;
const weekDayRegExp = /^(monday|tuesday|wednesday|thursday|friday)$/;
const timeRepeatingValueRegExp = /^(year|month|week|day)$/;
const creditCardNumberRegExp = /^[0-9]{16}$/;

const Validator = {
  isWeekDay,
  isNameValid,
  isEmailValid,
  isLargeTextValid,
  isCreditCardNumber,
  isTimeRepeatingValue
};

function isEmailValid(email) {
  return emailRegExp.test(email);
}

function isLargeTextValid(text) {
  return largeTextRegExp.test(text);
}

function isNameValid(name) {
  return nameRegExp.test(name);
}

function isWeekDay(weekDay) {
  return weekDayRegExp.test(weekDay);
}

function isTimeRepeatingValue(value) {
  return timeRepeatingValueRegExp.test(value);
}

function isCreditCardNumber(number) {
  return creditCardNumberRegExp.test(number);
}

module.exports = Validator;
