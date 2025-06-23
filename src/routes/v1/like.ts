import { Router } from "express";
import { body, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import likeBlog from "@/controllers/v1/like/like_blog";

const router = Router();

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("userId")
    .notEmpty()
    .withMessage("User id is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  validationError,
  likeBlog
);

export default router;
