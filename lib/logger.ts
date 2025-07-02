import pino, { Logger } from "pino"

export const logger: Logger =
  process.env["NODE_ENV"] === "production"
    ? // JSON in production
      pino({
        level: "info",
        timestamp: () => `,"ts":${Date.now() / 1000}`,
        formatters: {
          level: label => {
            return { level: label.toUpperCase() }
          },
        },
        base: null,
        crlf: true,
      })
    : // Pretty print in development
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            messageFormat: "{ts} {msg}",
            translateTime: "SYS:standard",
          },
        },
        level: "debug",
        base: null,
      })

export const getCorrelationId = (headers: Headers) => {
  let correlationId = headers.get("x-correlation-id")
  if (!correlationId) {
    correlationId = crypto.randomUUID()
  }
  return correlationId
}
