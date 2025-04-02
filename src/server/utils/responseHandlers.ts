import { Response } from 'express';
import { Types } from 'mongoose';

/**
 * Function to handle errors. It will log the error and return a response with
 * the error message and status.
 *
 * @param error - The error to be handled
 * @param res - The response object
 * @param status - The status to be returned. Default is 500
 * @returns - The response with the error message and status
 */
export function handleError(error: Error, res: Response, status = 500): Response {
  let newStatus = status;

  if (error.message.includes('not found')) {
    newStatus = 404;
  } else if (error.message.includes('is not allowed')) {
    newStatus = 403;
  }

  return res.status(newStatus).send({ error: error.message });
}

/**
 * Validates if a string is a valid Mongoose ObjectId.
 *
 * @param {string} id The string to validate as a Mongoose ObjectId.
 * @returns {boolean} True if the string is a valid ObjectId, false otherwise.
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}
