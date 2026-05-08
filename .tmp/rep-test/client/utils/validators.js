"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditCardNumberRegex = exports.regExpOnlyNumbers = exports.regExpNameWithNumbers = exports.regExpName = exports.regExpPassword = exports.regExpEmail = void 0;
/**
 * regExpEmail - Regular expression for email validation.
 */
exports.regExpEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
 * regExpPassword - Regular expression for password validation. It requires at least 10 characters,
 * one lowercase letter, one uppercase letter, one number and one special character in the set !@#
 */
exports.regExpPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#-])[a-zA-Z\d!@#-]{10,}$/;
/**
 * regExpName - Regular expression for name validation. It requires at least one letter, it allow
 * spaces, hyphens and accents.
 */
exports.regExpName = /^[a-zA-ZÀ-ÿ\s-]+$/;
/**
 * regExpNameWithNumbers - Regular expression for name validation. It requires at least one letter, it allow
 * spaces, hyphens, accents and numbers.
 */
exports.regExpNameWithNumbers = /^[a-zA-ZÀ-ÿ\s-0-9]+$/;
/**
 * regExpOnlyNumbers - Regular expression for only numbers validation.
 */
exports.regExpOnlyNumbers = /^[0-9]+$/;
/**
 * creditCardNumberRegex - Regular expression for credit card number validation. It allows up to 16 digits.
 */
exports.creditCardNumberRegex = /^[0-9]{0,16}$/;
