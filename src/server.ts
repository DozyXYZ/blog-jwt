import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

import config from "@/config";
import limiter from "@/lib/express_rate_limit";
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongoose";
import { logger } from "@/lib/winston";

import type { CorsOptions } from "cors";

import v1Routes from "@/routes/v1";

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || config.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(helmet());
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running on http://localhost:${config.PORT}`);
      logger.info(
        `API documentation available at: http://localhost:${config.PORT}/api/v1/swagger`
      );
      logger.info(
        `Swagger JSON requested: http://localhost:${config.PORT}/api/v1/swagger/json`
      );
    });
  } catch (err) {
    logger.error("Failed to start the server:", err);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn("Server SHUTDOWN");
    process.exit(0);
  } catch (err) {
    logger.error("Error during server shutdown:", err);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
