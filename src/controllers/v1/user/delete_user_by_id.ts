import { v2 as cloudinary } from "cloudinary";

import { logger } from "@/lib/winston";

import User from "@/models/user";
import Blog from "@/models/blog";

import type { Request, Response } from "express";

const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select("banner.publicId")
      .lean()
      .exec();
    const publicIds = blogs.map(({ banner }) => banner.publicId);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
      logger.info("Multiple banner images deleted from Cloudinary", {
        publicIds,
      });
    }

    await Blog.deleteMany({ author: userId });
    logger.info("All blogs by user deleted", { userId, blogs });

    await User.deleteOne({ _id: userId });
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
