import { type Context } from 'hono';

export const methodNotAllowed = (c: Context) => {
  return c.json({ status: 405, message: 'method not allowed' }, 405);
};

export const validationHook = (result, c: Context) => {
  if (!result.success) {
    return c.jsonT(
      {
        code: 400,
        message: 'Validation Error',
      },
      400,
    );
  }
};
