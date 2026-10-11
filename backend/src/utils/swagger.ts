import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskSphere Pro API",
      version: "1.0.0",
      description: "Production REST API documentation for TaskSphere Pro — Enterprise Task & Productivity Platform"
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Local development server"
      }
    ]
  },
  apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);
