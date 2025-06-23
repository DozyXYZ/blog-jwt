import { Router } from "express";
import { body, query, param } from "express-validator";
import multer from "multer";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";

import createBlog from "@/controllers/v1/blog/create_blog";

const upload = multer();

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("banner_image"),
  uploadBlogBanner("post"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
  validationError,
  createBlog
);

export default router;
