type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string = 'lucid-agents-backend') {
    this.serviceName = serviceName;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}] ${message}${logData}`;
  }

  info(message: string, data?: LogData): void {
    console.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: LogData): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: Error | LogData, data?: LogData): void {
    if (error instanceof Error) {
      console.error(this.formatMessage('error', message, { 
        ...data, 
        error: error.message, 
        stack: error.stack 
      }));
    } else {
      console.error(this.formatMessage('error', message, error));
    }
  }

  debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  logRequest(method: string, url: string, responseTime: number, statusCode: number, userAgent?: string, ip?: string): void {
    this.info('HTTP Request', {
      method,
      url,
      userAgent,
      ip,
      responseTime: `${responseTime}ms`,
      statusCode
    });
  }

  logAgentEvent(agentId: number | string, event: string, data: LogData = {}): void {
    this.info('Agent Event', {
      agentId,
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  logTaskExecution(taskId: number | string, agentId: number | string, status: string, executionTime: number, error?: Error): void {
    const logData: LogData = {
      taskId,
      agentId,
      status,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    };

    if (error) {
      this.error('Task Execution Error', error, logData);
    } else {
      this.info('Task Execution', logData);
    }
  }

  logDeployment(agentId: number | string, deploymentType: string, status: string, details: LogData = {}): void {
    this.info('Deployment Event', {
      agentId,
      deploymentType,
      status,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
}

export const logger = new Logger();
export default logger;
