import { logger } from "@/lib/winston";

import User from "@/models/user";

import type { Request, Response } from "express";

const updateCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    website,
    twitter,
    instagram,
    facebook,
    youtube,
    linkedin,
    github,
  } = req.body;

  try {
    const user = await User.findById(userId).select("+password -__v").exec();

    if (!user) {
      res.status(404).json({
        code: "UserNotFound",
        message: "User not found",
      });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;

    if (!user.socialLinks) {
      user.socialLinks = {};
    }

    if (website) user.socialLinks.website = website;
    if (twitter) user.socialLinks.twitter = twitter;
    if (instagram) user.socialLinks.instagram = instagram;
    if (facebook) user.socialLinks.facebook = facebook;
    if (youtube) user.socialLinks.youtube = youtube;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (github) user.socialLinks.github = github;

    await user.save();

    logger.info("User updated successfully", user);

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });

    logger.error("Error while updating current user", err);
  }
};

export default updateCurrentUser;
