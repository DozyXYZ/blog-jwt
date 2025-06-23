import { Router } from "express";

import authRoutes from "@/routes/v1/auth";
import userRoutes from "@/routes/v1/user";
import blogRoutes from "@/routes/v1/blog";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Blog API!",
    status: "success",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/blogs", blogRoutes);

export default router;
