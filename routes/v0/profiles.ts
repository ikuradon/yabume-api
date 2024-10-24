import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { generateImageUrl } from '@imgproxy/imgproxy-node';
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
import { ImgproxyConfig } from '/lib/constants.ts';

let imgproxyConfig: ImgproxyConfig | undefined;
if (IMGPROXY_BASEURL != null && IMGPROXY_KEY != null && IMGPROXY_SALT != null) {
  imgproxyConfig = {
    endpoint: IMGPROXY_BASEURL,
    key: IMGPROXY_KEY,
    salt: IMGPROXY_SALT,
  };
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
      description: 'Event Not Found',
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
      description: 'Event Not Found',
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
  return c.json(event, 200);
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

  if (imgproxyConfig != null && size !== 0) {
    return c.json({
      picture: generateImageUrl({
        ...imgproxyConfig,
        url: picture,
        options: {
          resizing_type: 'fill',
          width: size,
          height: size,
        },
      }),
      banner: generateImageUrl({
        ...imgproxyConfig,
        url: banner,
        options: {
          resizing_type: 'fill',
          width: size,
          height: size,
        },
      }),
    }, 200);
  } else {
    return c.json({ picture, banner }, 200);
  }
});
