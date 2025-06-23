import { Router } from "express";
import { body, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import createComment from "@/controllers/v1/comment/create_comment";

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

export default router;
