import { Router } from "express";
import { body, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import likeBlog from "@/controllers/v1/like/like_blog";
import unlikeBlog from "@/controllers/v1/like/unlike_blog";

const router = Router();

/**
 * @swagger
 * /likes/blog/{blogId}:
 *   post:
 *     summary: Like a blog
 *     tags:
 *       - Likes
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to like
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user liking the blog
 *     responses:
 *       200:
 *         description: Blog liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likesCount:
 *                   type: integer
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
  body("userId")
    .notEmpty()
    .withMessage("User id is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  validationError,
  likeBlog
);

/**
 * @swagger
 * /likes/blog/{blogId}:
 *   delete:
 *     summary: Unlike a blog
 *     tags:
 *       - Likes
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to unlike
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user unliking the blog
 *     responses:
 *       204:
 *         description: Blog unliked successfully (no content)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: Like / Blog / User not found
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
 *                   example: Like not found
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
  unlikeBlog
);

export default router;
