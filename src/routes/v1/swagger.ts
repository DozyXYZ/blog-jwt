import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import config from "@/config";

import type { Request, Response } from "express";

const router = Router();

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",

    info: {
      title: "Blog API",
      version: "1.0.0",
      description: "API documentation for the Blog application",
    },

    tags: [
      {
        name: "Authentication",
        description: "Operations related to user authentication",
      },
      {
        name: "Users",
        description: "Operations related to user management",
      },
      {
        name: "Blogs",
        description: "Operations related to blog management",
      },
      {
        name: "Likes",
        description: "Operations related to likes on blogs",
      },
      {
        name: "Comments",
        description: "Operations related to comments on blogs",
      },
    ],

    servers: [
      {
        url: `http://localhost:${config.PORT}/api/v1`,
        description: "Development server",
      },
    ],

    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT key authorization for API",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key authorization for API",
        },
      },
    },
  },
  apis: ["src/routes/v1/*.ts", "src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

router.get("/json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
