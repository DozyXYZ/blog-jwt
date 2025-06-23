import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

import { logger } from "@/lib/winston";

import Blog from "@/models/blog";
import Comment from "@/models/comment";

import type { Request, Response } from "express";
import type { IComment } from "@/models/comment";

type CommentData = Pick<IComment, "content">;

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const createComment = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body as CommentData;
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select("_id commentsCount").exec();

    if (!blog) {
      res.status(404).json({
        message: "Blog not found",
        status: "error",
      });
      return;
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId,
    });

    logger.info("New comment created", newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info("Blog comments count updated", {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.status(201).json({
      commentCount: blog.commentsCount,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });

    logger.error("Error while commenting in a blog", err);
  }
};

export default createComment;
