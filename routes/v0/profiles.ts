import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { validationHook } from "/lib/honoHelper.ts";
import { nip19ToHex } from "/lib/nostr.ts";
import { getProfile } from "/lib/relay.ts";
import {
  errorSchema,
  nostrEventSchema,
  profileParamsSchema,
} from "/lib/schema.ts";

const getProfileRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: profileParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: nostrEventSchema,
        },
      },
      description: "Retrieve the profile event",
    },
    400: {
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
      description: "Returns an error",
    },
  },
});

export const profilesAPI = new OpenAPIHono({ defaultHook: validationHook });

profilesAPI.openapi(getProfileRoute, async (c) => {
  const { id }: { id: string } = c.req.valid("param");
  const hex = nip19ToHex(id);

  const event = await getProfile(hex);
  if (event == null)
    return c.jsonT({ code: 404, message: "Event Not Found" }, 404);
  return c.jsonT(event);
});
