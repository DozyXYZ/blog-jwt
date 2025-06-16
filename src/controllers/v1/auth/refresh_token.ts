import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { logger } from "@/lib/winston";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";

import Token from "@/models/token";

import type { Request, Response } from "express";
import { Types } from "mongoose";

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }

    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Refresh token expired. Please login again.",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });

    logger.error("Error during refresh token", err);
  }
};

export default refreshToken;
