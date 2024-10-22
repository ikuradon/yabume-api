import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { validateEvent, verifyEvent } from 'nostr-tools';
import { validationHook } from '/lib/honoHelper.ts';
import { checkIP } from '/lib/maxmind.ts';
import { nip19ToHex } from '/lib/nostr.ts';
import { getEvent, publish } from '/lib/relay.ts';
import { errorSchema, eventParamsSchema, eventPublishedSchema, nostrEventSchema } from '/lib/schema.ts';

const getEventRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: eventParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: nostrEventSchema,
        },
      },
      description: 'Retrieve the event',
    },
    400: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
  },
});

const publishEventRoute = createRoute({
  method: 'post',
  path: '',
  request: {
    body: {
      content: {
        'application/json': {
          schema: nostrEventSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: eventPublishedSchema,
        },
      },
      description: 'Event successfully published',
    },
    400: {
      content: {
        'application/json': {
          schema: errorSchema,
        },
      },
      description: 'Returns an error',
    },
  },
});

export const eventsAPI = new OpenAPIHono({ defaultHook: validationHook });

eventsAPI.openapi(getEventRoute, async (c) => {
  const { id }: { id: string } = c.req.valid('param');
  const hex = nip19ToHex(id);

  const event = await getEvent(hex);
  if (event == null) {
    return c.json({ code: 404, message: 'Event not found' }, 404);
  }
  return c.json(event);
});

eventsAPI.openapi(publishEventRoute, async (c) => {
  const user_ip = c.req.header('X-Forwarded-For') || null;
  if (user_ip != null && !checkIP(user_ip)) {
    return c.json({ code: 403, message: 'Access denied' }, 403);
  }
  const event = c.req.valid('json');
  try {
    if (!validateEvent(event) || !verifyEvent(event)) {
      return c.json({ code: 400, message: 'Event is not valid' }, 400);
    }
  } catch (_) {
    return c.json(
      {
        code: 400,
        message: "Can't validate event",
      },
      400,
    );
  }

  await publish(event);
  return c.json({
    code: 201,
    message: 'Event Published',
  }, 201);
});
