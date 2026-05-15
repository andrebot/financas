import { Response } from 'express';

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
 * Validates if a value is a valid positive integer SQL id.
 *
 * @param id - The value to validate.
 * @returns True if the value is a positive integer, false otherwise.
 */
export function isValidObjectId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}
