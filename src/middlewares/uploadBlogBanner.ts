import { logger } from "@/lib/winston";
import uploadToCloudiary from "@/lib/cloudinary";

import Blog from "@/models/blog";

import type { Request, Response, NextFunction } from "express";
import type { UploadApiErrorResponse } from "cloudinary";

/**
 * @swagger
 * components:
 *   requestBodies:
 *     CreateBlog:
 *       description: Blog creation form with an image file for Cloudinary upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - status
 *               - banner_image
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Blog"
 *               content:
 *                 type: string
 *                 example: "This is the full blog content with markdown support."
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: "published"
 *               banner_image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (jpg, jpeg, png, or webp). This will be uploaded to Cloudinary.
 *     UpdateBlog:
 *       description: Blog update form with an optional image file for Cloudinary upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               content:
 *                 type: string
 *                 example: "Updated blog content with markdown support."
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: "published"
 *               banner_image:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) New image file to upload (jpg, jpeg, png, or webp). This will be uploaded to Cloudinary.
 *   responses:
 *     BlogBannerTooLarge:
 *       description: Uploaded blog banner image exceeds 2 MB limit
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: ValidationError
 *               message:
 *                 type: string
 *                 example: File size cannot exceed 2 MB
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const uploadBlogBanner = (method: "post" | "put") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (method === "put" && !req.file) {
      next();
      return;
    }

    if (!req.file) {
      res.status(400).json({
        code: "ValidationError",
        message: "Blog banner image is required",
      });
      return;
    }

    if (req.file.size > MAX_FILE_SIZE) {
      res.status(413).json({
        code: "ValidationError",
        message: "File size cannot exceed 2 MB",
      });
      return;
    }

    try {
      const { blogId } = req.params;
      const blog = await Blog.findById(blogId).select("banner.publicId").exec();

      const data = await uploadToCloudiary(
        req.file.buffer,
        blog?.banner.publicId.replace("blog-api/", "")
      );

      if (!data) {
        res.status(500).json({
          code: "ServerError",
          message: "Internal Server Error",
        });

        logger.error("Error while uploading blog banner to Cloudinary", {
          blogId,
          publicId: blog?.banner.publicId,
        });

        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info("Blog banner uploaded to Cloudinary", {
        blogId,
        banner: newBanner,
      });

      req.body.banner = newBanner;

      next();
    } catch (err: UploadApiErrorResponse | any) {
      res.status(err.http_code).json({
        code: err.http_code < 500 ? "ValidationError" : err.name,
        message: err.message,
      });

      logger.error("Error while uploading blog banner to Cloudinary", err);
    }
  };
};

export default uploadBlogBanner;
