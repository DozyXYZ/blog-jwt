import { Router } from "express";
import { body, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import createComment from "@/controllers/v1/comment/create_comment";
import getCommentsByBlog from "@/controllers/v1/comment/get_comments_by_blog";
import deleteComment from "@/controllers/v1/comment/delete_comment";

const router = Router();

/**
 * @swagger
 * /comments/blog/{blogId}:
 *   post:
 *     summary: Create a comment on a blog
 *     tags:
 *       - Comments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great blog post!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 commentCount:
 *                   type: integer
 *                   description: The updated number of comments on the blog
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
router.post(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  validationError,
  createComment
);

/**
 * @swagger
 * /comments/blog/{blogId}:
 *   get:
 *     summary: Get all comments for a specific blog
 *     tags:
 *       - Comments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to retrieve comments for
 *     responses:
 *       200:
 *         description: List of comments for the blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
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
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  validationError,
  getCommentsByBlog
);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       204:
 *         description: Comment deleted successfully (no content)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Blog / User / Comment not found
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
router.delete(
  "/:commentId",
  authenticate,
  authorize(["admin", "user"]),
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
  validationError,
  deleteComment
);

export default router;
