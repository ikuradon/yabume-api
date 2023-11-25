import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import Imgproxy from "imgproxy";
import { validationHook } from "/lib/honoHelper.ts";
import { nip19ToHex } from "/lib/nostr.ts";
import { getProfile } from "/lib/relay.ts";
import {
  errorSchema,
  nostrEventSchema,
  nostrPictureSchema,
  profileParamsSchema,
  pictureQuerySchema,
} from "/lib/schema.ts";

const imgproxy = new Imgproxy.default({
  baseUrl: Deno.env.get("IMGPROXY_BASEURL") as string,
  key: Deno.env.get("IMGPROXY_KEY") as string,
  salt: Deno.env.get("IMGPROXY_SALT") as string,
  encode: true,
});

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

const gerProfilePictureRoute = createRoute({
  method: "get",
  path: "/{id}/picture",
  request: {
    params: profileParamsSchema,
    query: pictureQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: nostrPictureSchema,
        },
      },
      description: "Retrive the profile picture",
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

profilesAPI.openapi(gerProfilePictureRoute, async (c) => {
  const { id }: { id: string } = c.req.valid("param");
  const { size }: { size: number } = c.req.valid("query");
  const hex = nip19ToHex(id);

  const event = await getProfile(hex);
  if (event == null)
    return c.jsonT({ code: 404, message: "Event Not Found" }, 404);

  const content = JSON.parse(event.content);
  const picture = content.picture || "";
  const banner = content.banner || "";

  if (size === 0) return c.jsonT({ picture, banner });
  else
    return c.jsonT({
      picture: imgproxy
        .builder()
        .resize("fill", size, size, false)
        .generateUrl(picture),
      banner: imgproxy
        .builder()
        .resize("fill", size, size, false)
        .generateUrl(banner),
    });
});
