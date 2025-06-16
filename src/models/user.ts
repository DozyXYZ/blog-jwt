import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      maxLength: [20, "Username cannot exceed 20 characters"],
      unique: [true, "Username must be unique"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      maxlength: [50, "Email cannot exceed 50 characters"],
      unique: [true, "Email must be unique"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },

    firstName: {
      type: String,
      maxlength: [20, "First name cannot exceed 20 characters"],
    },

    lastName: {
      type: String,
      maxlength: [20, "Last name cannot exceed 20 characters"],
    },

    socialLinks: {
      website: {
        type: String,
        maxlength: [100, "Website address cannot exceed 100 characters"],
      },
      twitter: {
        type: String,
        maxlength: [50, "Twitter profile URL cannot exceed 50 characters"],
      },
      instagram: {
        type: String,
        maxlength: [50, "Instagram profile URL cannot exceed 50 characters"],
      },
      facebook: {
        type: String,
        maxlength: [50, "Facebook profile URL cannot exceed 50 characters"],
      },
      youtube: {
        type: String,
        maxlength: [50, "YouTube channel URL cannot exceed 50 characters"],
      },
      linkedin: {
        type: String,
        maxlength: [50, "LinkedIn profile URL cannot exceed 50 characters"],
      },
      github: {
        type: String,
        maxlength: [50, "GitHub profile URL cannot exceed 50 characters"],
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>("User", userSchema);
