import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

/**
 * @swagger
 * components:
 *   responses:
 *     AuthenticationError:
 *       description: Authentication failed or access token is invalid/expired
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: AuthenticationError
 *               message:
 *                 type: string
 *                 example: Access token invalid or expired
 */
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "AuthenticationError",
      message: "Access denied. No token provided.",
    });
    return;
  }

  const [_, token] = authHeader.split(" ");

  try {
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token invalid",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });

    logger.error("Error during authentication", err);
  }
};

export default authenticate;
