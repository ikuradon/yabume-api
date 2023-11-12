import { z } from "@hono/zod-openapi";
import * as nostrRegex from "/lib/regex.ts";
import { type Event } from "nostr-tools";

export const nostrEventSchema: z.ZodType<Event> = z
  .object({
    id: z
      .string()
      .regex(/[0-9a-f]{64}/)
      .openapi({
        example:
          "9ce300c5a8e3b0947c2f7f4a105b0baf78414157dd3a04da15314aeadcd0fb51",
        type: "string",
      }),
    pubkey: z
      .string()
      .regex(/[0-9a-f]{64}/)
      .openapi({
        example:
          "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        type: "string",
      }),
    created_at: z.number().int().openapi({
      example: 1699712047,
      type: "number",
    }),
    kind: z.number().int().openapi({
      example: 1,
      type: "number",
    }),
    tags: z.array(z.array(z.string()).nonempty()).openapi({
      example: [],
    }),
    content: z.string().openapi({
      example: "hello world",
      type: "string",
    }),
    sig: z
      .string()
      .regex(/[0-9a-f]{128}/)
      .openapi({
        example:
          "82a64ca64d2063190683cf18c8d306f53a18b445361f7ecd94a7cb346ec915f99d4590505229419f58761f836cb94d4bcde7af7c00bcbe1eaf9647ca02f9d2b3",
        type: "string",
      }),
  })
  .openapi("Event");

export const eventParamsSchema = z.object({
  id: z
    .union([
      z.string().regex(nostrRegex.hex),
      z.string().regex(nostrRegex.note),
      z.string().regex(nostrRegex.nevent),
    ])
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example:
        "9ce300c5a8e3b0947c2f7f4a105b0baf78414157dd3a04da15314aeadcd0fb51",
      examples: [
        "9ce300c5a8e3b0947c2f7f4a105b0baf78414157dd3a04da15314aeadcd0fb51",
        "note1nn3sp3dguwcfglp00a9pqkct4auyzs2hm5aqfks4x99w4hxsldgsu2xn0q",
        "nevent1qqsfeccqck5w8vy50shh7jsstv9677zpg9ta6wsymg2nzjh2mng0k5gstrnpz",
      ],
      type: "string",
    }),
});

export const profileParamsSchema = z.object({
  id: z
    .union([
      z.string().regex(nostrRegex.hex),
      z.string().regex(nostrRegex.npub),
      z.string().regex(nostrRegex.nprofile),
    ])
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example:
        "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      examples: [
        "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        "npub1td6l6h6fu7qerfz7rj2rsez0uhgxt65cjgxx860wlphp285ehqysluzg43",
        "nprofile1qqs9ka0atay70qv3530pe9pcv387t5r9a2vfyrrra8h0sms4r6vmszg2j3an7",
      ],
      type: "string",
    }),
});

export const errorSchema = z.object({
  code: z.number().openapi({
    example: 400,
    type: "number",
  }),
  message: z.string().openapi({
    example: "Bad Request",
    type: "string",
  }),
});

export const eventPublishedSchema = z.object({
  code: z.number().openapi({
    example: 201,
    type: "number",
  }),
  message: z.string().openapi({
    example: "Event Published",
    type: "string",
  }),
});
