import pino, { Logger } from "pino";

export const logger: Logger =
  process.env["NODE_ENV"] === "production"
    ? // JSON in production
      pino({ level: "info" })
    : // Pretty print in development
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });

export const getCorrelationId = (headers: Headers) => {
  let correlationId = headers.get("x-correlation-id");
  if (!correlationId) {
    correlationId = crypto.randomUUID();
  }
  return correlationId;
};
