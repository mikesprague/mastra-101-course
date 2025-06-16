import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';

import { financialAgent } from './agents/finance-agent';
import { learningAssistantAgent } from './agents/learning-assistant';
import { memoryAgent } from './agents/memory-agent';
import { personalAssistantAgent } from './agents/personal-assistant-agent';
import { weatherAgent } from './agents/weather-agent';
import { notes } from './mcp/server';
import { weatherWorkflow } from './workflows/weather-workflow';

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

const mcpServers = {
  notes,
};

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
  mcpServers,
  storage,
  workflows,
  vectors,
});
