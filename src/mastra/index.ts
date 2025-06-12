import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

import { financialAgent } from './agents/finance-agent.ts';
import { learningAssistantAgent } from './agents/learning-assistant.js';
import { memoryAgent } from './agents/memory-agent.js';
import { personalAssistantAgent } from './agents/personal-assistant-agent.js';
import { weatherWorkflow } from './workflows/weather-workflow.ts';
import { weatherAgent } from './agents/weather-agent.ts';

const {
  SQLITE_DB_PATH,
  MASTRA_STORAGE_DB_NAME,
  MASTRA_VECTORS_DB_NAME,
  MASTRA_VECTORS_NAME,
} = process.env;

const agents = {
  weatherAgent,
  financialAgent,
  learningAssistantAgent,
  memoryAgent,
  personalAssistantAgent,
};

const logger = new PinoLogger({
  name: 'Mastra',
  level: 'info',
});

const storage = new LibSQLStore({
  url: `file:${SQLITE_DB_PATH}${MASTRA_STORAGE_DB_NAME}`,
});

const vectorStore = new LibSQLVector({
  connectionUrl: `file:${SQLITE_DB_PATH}${MASTRA_VECTORS_DB_NAME}`,
});

const vectors = {
  [MASTRA_VECTORS_NAME]: vectorStore,
};

const workflows = { weatherWorkflow };

export const mastra = new Mastra({
  agents,
  logger,
  storage,
  workflows,
  vectors,
});
