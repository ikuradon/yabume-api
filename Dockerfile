FROM denoland/deno:2.0.6

WORKDIR /app
COPY --chown=deno deno.* .
RUN deno cache deno.json

COPY --chown=deno . .

USER deno
EXPOSE 3000
CMD ["task", "serve"]
