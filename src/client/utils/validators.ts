/**
 * regExpEmail - Regular expression for email validation.
 */
export const regExpEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * regExpPassword - Regular expression for password validation. It requires at least 10 characters,
 * one lowercase letter, one uppercase letter, one number and one special character in the set !@#
 */
export const regExpPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#-])[a-zA-Z\d!@#-]{10,}$/;

/**
 * regExpName - Regular expression for name validation. It requires at least one letter, it allow
 * spaces, hyphens and accents.
 */
export const regExpName = /^[a-zA-ZÀ-ÿ\s-]+$/;

/**
 * regExpNameWithNumbers - Regular expression for name validation. It requires at least one letter, it allow
 * spaces, hyphens, accents and numbers.
 */
export const regExpNameWithNumbers = /^[a-zA-ZÀ-ÿ\s-0-9]+$/;

/**
 * regExpOnlyNumbers - Regular expression for only numbers validation.
 */
export const regExpOnlyNumbers = /^[0-9]+$/;

/**
 * creditCardNumberRegex - Regular expression for credit card number validation. It allows up to 16 digits.
 */
export const creditCardNumberRegex = /^[0-9]{0,16}$/;
