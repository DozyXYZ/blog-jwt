import { v2 as cloudinary } from "cloudinary";

import { logger } from "@/lib/winston";

import Blog from "@/models/blog";
import User from "@/models/user";

import type { Request, Response } from "express";

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select("role").lean().exec();
    const blog = await Blog.findById(blogId)
      .select("author banner.publicId")
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    if (blog.author !== userId && user?.role !== "admin") {
      res.status(403).json({
        code: "AuthorizationError",
        message: "Access denied, insufficient permissions",
      });

      logger.warn("A user attempted to delete a blog without permission", {
        userId,
        blog,
      });

      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info("Banner image deleted from Cloudinary", {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });
    logger.info("Blog deleted successfully", { blogId });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });

    logger.error("Error during blog deletion", err);
  }
};

export default deleteBlog;
