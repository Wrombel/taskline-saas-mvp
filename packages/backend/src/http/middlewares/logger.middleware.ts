import pino from "pino";

export interface AppError extends Record<string, unknown> {
  readonly _tag: string;
  readonly message: string;
  readonly stack?: string;
}

export const isAppError = (err: unknown): err is AppError => {
  return typeof err === "object" && err !== null && "_tag" in err;
};

const getLogLevel = () => process.env.LOG_LEVEL || "info";
const isDev = () => (process.env.NODE_ENV || "development") !== "production";

export const logger = pino({
  level: getLogLevel(),
  ...(isDev()
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),

  serializers: {
    err: (err: unknown) => {
      if (isAppError(err)) {
        const { _tag, ...rest } = err;
        return {
          type: _tag,
          ...rest,
        };
      }
      if (err instanceof Error) {
        return pino.stdSerializers.err(err);
      }

      return {
        raw: err,
        message: typeof err === "string" ? err : "Unknown error thrown",
      };
    },
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
