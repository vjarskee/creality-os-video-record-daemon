type LogLevel = 'info' | 'warn' | 'error'

function getLevelSign(level: LogLevel) {
  let result = level.toUpperCase()
  if (result.length < 5) result = result.padEnd(5, ' ')
  return result
}

class Logger {
  private format(level: LogLevel, context: string, message: string) {
    return `[${new Date().toLocaleString()}] ${getLevelSign(level)} [${context || 'App'}] ${message}`
  }

  log(context: string, message: string) {
    // eslint-disable-next-line no-console
    console.log(this.format('info', context, message))
  }

  error(context: string, message: string) {
    // eslint-disable-next-line no-console
    console.error(this.format('error', context, message))
  }

  warn(context: string, message: string) {
    // eslint-disable-next-line no-console
    console.warn(this.format('warn', context, message))
  }
}

export const logger = new Logger()
