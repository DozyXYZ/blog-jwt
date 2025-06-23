import { logger } from "@/lib/winston";

import Blog from "@/models/blog";
import comment from "@/models/comment";
import Comment from "@/models/comment";

import type { Request, Response } from "express";

const getCommentsByBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select("_id").lean().exec();

    if (!blog) {
      res.status(404).json({
        message: "Blog not found",
        status: "error",
      });
      return;
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      comments: allComments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });

    logger.error("Error retrieving all comments of a blog", err);
  }
};

export default getCommentsByBlog;
