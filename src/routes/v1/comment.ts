import { Router } from "express";
import { body, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import createComment from "@/controllers/v1/comment/create_comment";
import getCommentsByBlog from "@/controllers/v1/comment/get_comments_by_blog";
import deleteComment from "@/controllers/v1/comment/delete_comment";

const router = Router();

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  validationError,
  createComment
);

router.get(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  validationError,
  getCommentsByBlog
);

router.delete(
  "/:commentId",
  authenticate,
  authorize(["admin", "user"]),
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  validationError,
  deleteComment
);

export default router;
