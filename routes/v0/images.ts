import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { generateImageUrl, type IGenerateImageUrl } from '@imgproxy/imgproxy-node';
import { IMGPROXY_BASEURL, IMGPROXY_KEY, IMGPROXY_SALT } from '/lib/environment.ts';
import { validationHook } from '/lib/honoHelper.ts';
import { optimizeImageParamsSchema } from '/lib/schema.ts';
import { getOptionsMap } from '/lib/urlParse.ts';
import { ImgproxyConfig } from '/lib/constants.ts';

let imgproxyConfig: ImgproxyConfig | undefined;
if (IMGPROXY_BASEURL != null && IMGPROXY_KEY != null && IMGPROXY_SALT != null) {
  imgproxyConfig = {
    endpoint: IMGPROXY_BASEURL,
    key: IMGPROXY_KEY,
    salt: IMGPROXY_SALT,
  };
}

const optimizeImageRoute = createRoute({
  method: 'get',
  path: '/optimize/{opts}/:url{.*}',
  request: {
    params: optimizeImageParamsSchema,
  },
  responses: {
    301: {
      description: 'Redirect to optimized image url',
    },
    500: {
      description: 'Server error',
    },
  },
});

export const imagesAPI = new OpenAPIHono({ defaultHook: validationHook });

imagesAPI.openapi(optimizeImageRoute, (c) => {
  const { opts, url }: { opts: string; url: string } = c.req.valid('param');
  const query = c.req.url.split('?').slice(-1).join();
  const req_url = url + '?' + query;
  if (imgproxyConfig != null) {
    const options = getOptionsMap(opts);

    const optimizerOptions: IGenerateImageUrl['options'] = { resizing_type: 'fill' };
    if (options.width !== undefined) {
      optimizerOptions.width = options.width;
    }
    if (options.height !== undefined) {
      optimizerOptions.height = options.height;
    }
    if (options.width === undefined && options.height === undefined) {
      optimizerOptions.width = 300;
    }
    optimizerOptions.format = options.format !== undefined
      ? options.format === 'jpeg' ? 'jpg' : options.format
      : 'webp';
    optimizerOptions.quality = options.quality ?? 70;

    const optimizedUrl = generateImageUrl({
      ...imgproxyConfig,
      url: req_url,
      options: optimizerOptions,
    });
    return c.redirect(optimizedUrl, 301);
  } else {
    return c.json({ code: 500, message: 'Internal Server Error' }, 500);
  }
});
