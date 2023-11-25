import * as dotenv from "dotenv";

dotenv.loadSync({ export: true });
export const RELAY_URL = Deno.env.get("RELAY_URL");

export const IMGPROXY_BASEURL = Deno.env.get("IMGPROXY_BASEURL");
export const IMGPROXY_KEY = Deno.env.get("IMGPROXY_KEY");
export const IMGPROXY_SALT = Deno.env.get("IMGPROXY_SALT");
