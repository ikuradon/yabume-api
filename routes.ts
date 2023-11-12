import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { v0 } from "./routes/v0.ts";

export const routes = new OpenAPIHono();

routes.route("/v0", v0);

routes.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "0.0.0",
    title: "823API",
  },
});

routes.get("/", swaggerUI({ url: "/doc" }));
