import { Router } from "express";
import { body, query, param } from "express-validator";
import multer from "multer";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";

import createBlog from "@/controllers/v1/blog/create_blog";
import getAllBlogs from "@/controllers/v1/blog/get_all_blogs";
import getBlogsByUser from "@/controllers/v1/blog/get_blogs_by_user";
import getBlogBySlug from "@/controllers/v1/blog/get_blog_by_slug";
import updateBlog from "@/controllers/v1/blog/update_blog";
import deleteBlog from "@/controllers/v1/blog/delete_blog";

const upload = multer();

const router = Router();

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog - ADMIN ONLY
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateBlog'
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       413:
 *         $ref: '#/components/responses/BlogBannerTooLarge'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
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

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs with pagination and status filtering - user can only see published blogs
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of blogs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of blogs to skip
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
  validationError,
  getAllBlogs
);

/**
 * @swagger
 * /blogs/user/{userId}:
 *   get:
 *     summary: Get all blogs by a specific user with pagination and status filtering
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose blogs to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of blogs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of blogs to skip
 *     responses:
 *       200:
 *         description: List of blogs by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get(
  "/user/:userId",
  authenticate,
  authorize(["admin", "user"]),
  param("userId").isMongoId().withMessage("Invalid user ID"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
  validationError,
  getBlogsByUser
);

/**
 * @swagger
 * /blogs/{slug}:
 *   get:
 *     summary: Get a blog by its slug
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the blog to retrieve
 *     responses:
 *       200:
 *         description: Blog found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Blog / User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NotFound
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.get(
  "/:slug",
  authenticate,
  authorize(["admin", "user"]),
  param("slug").notEmpty().withMessage("Slug is required"),
  validationError,
  getBlogBySlug
);

/**
 * @swagger
 * /blogs/{blogId}:
 *   put:
 *     summary: Update a blog - ADMIN ONLY
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to update
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateBlog'
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Blog / User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NotFound
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       413:
 *         $ref: '#/components/responses/BlogBannerTooLarge'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.put(
  "/:blogId",
  authenticate,
  authorize(["admin"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  upload.single("banner_image"),
  body("title")
    .optional()
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
  validationError,
  uploadBlogBanner("put"),
  updateBlog
);

/**
 * @swagger
 * /blogs/{blogId}:
 *   delete:
 *     summary: Delete a blog by its ID - ADMIN ONLY
 *     tags:
 *       - Blogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to delete
 *     responses:
 *       204:
 *         description: Blog deleted successfully (no content)
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NotFound
 *                 message:
 *                   type: string
 *                   example: Blog not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
router.delete("/:blogId", authenticate, authorize(["admin"]), deleteBlog);

export default router;
