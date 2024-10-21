import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import Imgproxy from 'imgproxy';
import { IMGPROXY_BASEURL, IMGPROXY_KEY, IMGPROXY_SALT } from '/lib/environment.ts';
import { validationHook } from '/lib/honoHelper.ts';
import { nip19ToHex } from '/lib/nostr.ts';
import { getProfile } from '/lib/relay.ts';
import {
  errorSchema,
  nostrEventSchema,
  nostrPictureSchema,
  pictureQuerySchema,
  profileParamsSchema,
} from '/lib/schema.ts';

let imgproxy: Imgproxy.Imgproxy;
if (IMGPROXY_BASEURL != null && IMGPROXY_KEY != null && IMGPROXY_SALT != null) {
  imgproxy = new Imgproxy.default({
    baseUrl: IMGPROXY_BASEURL,
    key: IMGPROXY_KEY,
    salt: IMGPROXY_SALT,
    encode: true,
  });
}

const getProfileRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: profileParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: nostrEventSchema,
        },
      },
      description: 'Retrieve the profile event',
    },
    400: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
    404: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
  },
});

const getProfilePictureRoute = createRoute({
  method: 'get',
  path: '/{id}/picture',
  request: {
    params: profileParamsSchema,
    query: pictureQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: nostrPictureSchema,
        },
      },
      description: 'Retrive the profile picture',
    },
    400: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
    404: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
  },
});

export const profilesAPI = new OpenAPIHono({ defaultHook: validationHook });

profilesAPI.openapi(getProfileRoute, async (c) => {
  const { id }: { id: string } = c.req.valid('param');
  const hex = nip19ToHex(id);

  const event = await getProfile(hex);
  if (event == null) {
    return c.json({ code: 404, message: 'Event Not Found' }, 404);
  }
  return c.json(event);
});

profilesAPI.openapi(getProfilePictureRoute, async (c) => {
  const { id }: { id: string } = c.req.valid('param');
  const { size }: { size: number } = c.req.valid('query');
  const hex = nip19ToHex(id);

  const event = await getProfile(hex);
  if (event == null) {
    return c.json({ code: 404, message: 'Event Not Found' }, 404);
  }

  const content = JSON.parse(event.content);
  const picture = content.picture || '';
  const banner = content.banner || '';

  if (imgproxy != null && size !== 0) {
    return c.json({
      picture: imgproxy
        .builder()
        .resize('fill', size, size, false)
        .generateUrl(picture),
      banner: imgproxy
        .builder()
        .resize('fit', size, size, false)
        .generateUrl(banner),
    });
  } else {
    return c.json({ picture, banner });
  }
});
