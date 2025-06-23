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

router.get(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser
);

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

router.delete(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  deleteCurrentUser
);

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

router.get(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  getUserById
);

router.delete(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  deleteUserById
);

export default router;
