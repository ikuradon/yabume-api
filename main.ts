import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { routes } from './routes.ts';
import * as maxmind from '/lib/maxmind.ts';
import * as relay from '/lib/relay.ts';
import { RELAY_URL } from '/lib/environment.ts';

if (RELAY_URL == null) Deno.exit(1);
await relay.init(RELAY_URL);
await maxmind.init();

const app = new Hono();

app.use('*', logger());

app.route('/', routes);

app.notFound((c) => c.json({ status: 404, message: 'not found' }, 404));

Deno.serve({ port: 3000, hostname: '[::]' }, app.fetch);
