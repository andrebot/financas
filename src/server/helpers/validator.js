
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const largeTextRegExp = /^[a-zA-Z0-9\u00C0-\u00FF\-\_\\\s\.\,\#\!\*\+\:\;\@\(\)\&\'\?\"\$\%]*$/;
const nameRegExp = /^[a-zA-Z0-9\u00C0-\u00FF\-\s]+$/;
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

/**
 * Check if the string provided is an email
 * 
 * @param {String} email
 * @returns {Boolean} result if the string is or not an email
 */
function isEmailValid(email) {
  return emailRegExp.test(email);
}

/**
 * Check if the provided text contains supported characteres.
 * 
 * @param {String} text
 * @returns {Boolean} result is the string is or not 
 */
function isLargeTextValid(text) {
  return largeTextRegExp.test(text);
}

/**
 * Check if the provided name contains supported characteres
 * 
 * @param {String} name
 * @returns {Boolean} result is the string is or not a valid name
 */
function isNameValid(name) {
  return nameRegExp.test(name);
}

/**
 * Check if the provided value is a valid week day. We support only
 * working days with all lower case letters.
 * 
 * @param {String} weekDay
 * @returns {Boolean} result is the string is or not a valid weekday
 */
function isWeekDay(weekDay) {
  return weekDayRegExp.test(weekDay);
}

/**
 * Check if the provided value is a valid frequency. We support only
 * year|month|week|day with all lower case letters.
 * 
 * @param {String} value
 * @returns {Boolean} result is the string is or not a valid frequency
 */
function isTimeRepeatingValue(value) {
  return timeRepeatingValueRegExp.test(value);
}

/**
 * Check is the provided string is a valid credit card number.
 * 
 * @param {String} number
 * @returns {Boolean} result is the string is or not a valid credit card number
 */
function isCreditCardNumber(number) {
  return creditCardNumberRegExp.test(number);
}

module.exports = Validator;
