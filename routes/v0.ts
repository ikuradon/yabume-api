import { OpenAPIHono } from "@hono/zod-openapi";
import { eventsAPI } from "./v0/events.ts";
import { profilesAPI } from "./v0/profiles.ts";

export const v0 = new OpenAPIHono();

v0.route("/events", eventsAPI);
v0.route("/profiles", profilesAPI);
