import { Router } from "express";

import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";

import getCurrentUser from "@/controllers/v1/user/get_current_user";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser
);

export default router;
