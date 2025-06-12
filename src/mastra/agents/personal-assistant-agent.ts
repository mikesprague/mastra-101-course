import path from 'node:path';
import { Agent } from '@mastra/core';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { MCPConfiguration } from '@mastra/mcp';
import { Memory } from '@mastra/memory';

import { gpt41, textEmbedding3Small } from '../../lib/models.ts';

const {
  COMPOSIO_MCP_GITHUB,
  MASTRA_STORAGE_DB_NAME,
  MASTRA_VECTORS_DB_NAME,
  SQLITE_DB_PATH,
  ZAPIER_MCP_URL,
} = process.env;

const mcp = new MCPConfiguration({
  servers: {
    zapier: {
      url: new URL(ZAPIER_MCP_URL || ''),
    },
    github: {
      url: new URL(COMPOSIO_MCP_GITHUB || ''),
    },
    hackernews: {
      command: 'npx',
      args: ['-y', '@devabdultech/hn-mcp-server'],
    },
    textEditor: {
      command: 'pnpx',
      args: [
        '@modelcontextprotocol/server-filesystem',
        path.join(process.cwd(), '../../', 'notes'),
      ],
    },
  },
});

const mcpTools = await mcp.getTools();

const name = 'Personal Assistant';

const instructions = `
  You are a helpful personal assistant that can help with various tasks such as email
  and scheduling social media posts.

  You have access to the following tools:

  1. Gmail:
      - Use these tools for reading and categorizing emails from Gmail
      - You can categorize emails by priority, identify action items, and summarize content
      - You can also use this tool to send emails

  2. GitHub:
      - Use these tools for monitoring and summarizing GitHub activity
      - You can summarize recent commits, pull requests, issues, and development patterns

  3. Hackernews:
      - Use this tool to search for stories on Hackernews
      - You can use it to get the top stories or specific stories
      - You can use it to retrieve comments for stories

  4. Filesystem:
      - You also have filesystem read/write access to a notes directory.
      - You can use that to store info for later use or organize info for the user.
      - You can use this notes directory to keep track of to-do list items for the user.
      - Notes dir: ${path.join(process.cwd(), 'notes')}

  Keep your responses concise and friendly.
`;

const model = gpt41;

const tools = { ...mcpTools };

const vector = new LibSQLVector({
  connectionUrl: `file:${SQLITE_DB_PATH}${MASTRA_VECTORS_DB_NAME}`,
});

const storage = new LibSQLStore({
  url: `file:${SQLITE_DB_PATH}${MASTRA_STORAGE_DB_NAME}`,
});

const embedder = textEmbedding3Small;

const workingMemoryTemplate = `
# User Profile

## Personal Info

- Name:
- Location:
- Timezone:

## Preferences

- Communication Style: [e.g., Formal, Casual]
- Project Goal:
- Key Deadlines:
  - [Deadline 1]: [Date]
  - [Deadline 2]: [Date]

## Session State

- Last Task Discussed:
- Open Questions:
  - [Question 1]
  - [Question 2]
`;

const memory = new Memory({
  storage,
  embedder,
  vector,
  options: {
    // Keep last 20 messages in context
    lastMessages: 20,
    // Enable semantic search to find relevant past conversations
    semanticRecall: {
      topK: 3,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
    // Enable working memory to remember user information
    workingMemory: {
      enabled: true,
      template: workingMemoryTemplate,
      // use: 'tool-call',
    },
  },
});

export const personalAssistantAgent = new Agent({
  name,
  instructions,
  model,
  tools,
  memory,
});
