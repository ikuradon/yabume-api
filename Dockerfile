FROM denoland/deno:2.0.6

WORKDIR /app

COPY --chown=deno . .
RUN deno cache main.ts

USER deno
EXPOSE 3000
CMD ["task", "serve"]
