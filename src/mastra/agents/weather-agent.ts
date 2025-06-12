import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';

import { gpt41Mini as model } from '../../lib/models.ts';

const { SQLITE_DB_PATH, MASTRA_STORAGE_DB_NAME } = process.env;

const storage = new LibSQLStore({
  url: `file:${SQLITE_DB_PATH}${MASTRA_STORAGE_DB_NAME}`,
});

const memory = new Memory({
  storage,
});

const tools = { weatherTool };

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model,
  tools,
  memory,
});
