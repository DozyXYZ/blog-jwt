import { Router } from "express";
import { body, query, param } from "express-validator";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

import getCurrentUser from "@/controllers/v1/user/get_current_user";
import updateCurrentuser from "@/controllers/v1/user/update_current_user";
import deleteCurrentUser from "@/controllers/v1/user/delete_current_user";
import getAllUsers from "@/controllers/v1/user/get_all_users";
import getUserById from "@/controllers/v1/user/get_user_by_id";
import deleteUserById from "@/controllers/v1/user/delete_user_by_id";

import User from "@/models/user";

const router = Router();

/**
 * @swagger
 * /users/current:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
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
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser
);

/**
 * @swagger
 * /users/current:
 *   put:
 *     summary: Update the current authenticated user's profile
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               website:
 *                 type: string
 *               twitter:
 *                 type: string
 *               instagram:
 *                 type: string
 *               facebook:
 *                 type: string
 *               youtube:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               github:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: UserNotFound
 *                 message:
 *                   type: string
 *                   example: User not found
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
router.put(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  body("username")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Username cannot exceed 20 characters")
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });

      if (userExists) {
        throw Error("This username is already taken");
      }
    }),
  body("email")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Email cannot exceed 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const emailExists = await User.exists({ email: value });

      if (emailExists) {
        throw Error("This email is already in use");
      }
    }),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage(
      "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol"
    ),
  body("first_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("First name cannot exceed 20 characters"),
  body("last_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name cannot exceed 20 characters"),
  body([
    "website",
    "twitter",
    "instagram",
    "facebook",
    "youtube",
    "linkedin",
    "github",
  ])
    .optional()
    .isURL()
    .withMessage("Invalid URL")
    .isLength({ max: 100 })
    .withMessage("URL cannot exceed 100 characters"),
  validationError,
  updateCurrentuser
);

/**
 * @swagger
 * /users/current:
 *   delete:
 *     summary: Delete the current authenticated user's account and all their blogs
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     responses:
 *       204:
 *         description: User account and all blogs deleted successfully (no content)
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
router.delete(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  deleteCurrentUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination - ADMIN ONLY
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *     responses:
 *       200:
 *         description: List of users
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
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
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
  authorize(["admin"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
  validationError,
  getAllUsers
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by their ID - ADMIN ONLY
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/AuthenticationError'
 *       403:
 *         $ref: '#/components/responses/AuthorizationError'
 *       404:
 *         description: User not found
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
 *                   example: User not found
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
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  getUserById
);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user by their ID - ADMIN ONLY
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       204:
 *         description: User account and all blogs deleted successfully (no content)
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
router.delete(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  deleteUserById
);

export default router;
