# Blog API

A blog backend built with Node.js, Express, and TypeScript. It includes authentication, authorization, content sanitization, file uploads, and API documentation. While admin role has access to all features, user role is only limited to some.

## Features

- JWT-based Authentication
- Input Sanitization with `dompurify` & `jsdom`
- Image Uploads via `multer` and `cloudinary`
- Swagger API Docs
- CORS and Helmet for security
- Request rate limiting
- Validation with `express-validator`
- MongoDB integration using `mongoose`
- Logging with `winston`

## Project Structure

```
├── src/
│ ├── @types/
│ ├── config/
│ ├── controllers/
│ ├── lib/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ └── server.ts
├── .env
├── tsconfig.json
├── package.json
└── README.md
```
