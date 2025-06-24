import { validationResult } from "express-validator";

import type { Request, Response, NextFunction } from "express";

/**
 * @swagger
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation error or Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               message:
 *                 type: string
 */
const validationError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      code: "ValidationError",
      errors: errors.mapped(),
    });
    return;
  }

  next();
};

export default validationError;
