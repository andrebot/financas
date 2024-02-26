/**
 * regExpEmail - Regular expression for email validation.
 */
export const regExpEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * regExpPassword - Regular expression for password validation. It requires at least 10 characters, one lowercase letter, one uppercase letter, one number and one special character in the set !@#-
 */
export const regExpPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#-])[a-zA-Z\d!@#-]{10,}$/;

/**
 * regExpBearer - Regular expression for Bearer token validation.
 */
export const regExpBearer = /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/;
