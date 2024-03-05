FROM denoland/deno:1.41.1

WORKDIR /app
USER deno
COPY --chown=deno deno.* .
RUN deno cache deno.json

COPY --chown=deno . .
RUN deno cache main.ts

EXPOSE 3000
CMD ["task", "serve"]
