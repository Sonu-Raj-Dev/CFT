type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LogLevelMap: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LogLevelMap[process.env.LOG_LEVEL as LogLevel] || LogLevelMap.info;

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatLog = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = formatTimestamp();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
};

export const logger = {
  debug: (message: string, data?: any) => {
    if (LogLevelMap.debug >= currentLogLevel) {
      console.debug(formatLog('debug', message, data));
    }
  },

  info: (message: string, data?: any) => {
    if (LogLevelMap.info >= currentLogLevel) {
      console.log(formatLog('info', message, data));
    }
  },

  warn: (message: string, data?: any) => {
    if (LogLevelMap.warn >= currentLogLevel) {
      console.warn(formatLog('warn', message, data));
    }
  },

  error: (message: string, data?: any) => {
    if (LogLevelMap.error >= currentLogLevel) {
      console.error(formatLog('error', message, data));
    }
  },

  log: (level: LogLevel, message: string, data?: any) => {
    const logFunc = logger[level];
    if (logFunc) {
      logFunc(message, data);
    }
  },
};
