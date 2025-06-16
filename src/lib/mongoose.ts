import mongoose from "mongoose";

import config from "@/config";

import type { ConnectOptions } from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "blog-db",
  appName: "Blog API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error("MongoDB URI is not defined in the environment variables.");
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);

    console.log("Connected to MongoDB successfully.", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    console.log("Error connecting to MongoDB:", err);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    console.log("Disconnected from MongoDB successfully.", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    console.log("Error disconnecting from MongoDB:", err);
  }
};
