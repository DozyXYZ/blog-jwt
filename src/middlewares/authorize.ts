import { logger } from "@/lib/winston";

import User from "@/models/user";

import type { Request, Response, NextFunction } from "express";

export type AuthRole = "admin" | "user";

/**
 * @swagger
 * components:
 *   responses:
 *     AuthorizationError:
 *       description: Access denied, insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: AuthorizationError
 *               message:
 *                 type: string
 *                 example: Access denied, insufficient permissions
 *     NotFound:
 *       description: User not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: NotFound
 *               message:
 *                 type: string
 *                 example: User not found
 */
const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select("role").exec();

      if (!user) {
        res.status(404).json({
          code: "NotFound",
          message: "User not found",
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          code: "AuthorizationError",
          message: "Access denied, insufficient permissions",
        });
        return;
      }

      return next();
    } catch (err) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal Server Error",
        error: err,
      });

      logger.error("Error while authorizing user", err);
    }
  };
};

export default authorize;
