import { logger } from "@/lib/winston";

import User from "@/models/user";

import type { Request, Response } from "express";

const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;

  try {
    await User.deleteOne({ _id: userId }).exec();

    logger.info("A user account deleted", { userId });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });

    logger.error("Error while deleting current user account", err);
  }
};

export default deleteUserById;
