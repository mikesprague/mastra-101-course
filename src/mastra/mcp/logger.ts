import { PinoLogger } from '@mastra/loggers';

export const mcpLogger = new PinoLogger({
  name: 'notes',
  level: 'debug',
});
