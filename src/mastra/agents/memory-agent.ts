import { Agent } from '@mastra/core/agent';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { Memory } from '@mastra/memory';

import { gpt41, textEmbedding3Small } from '../../lib/models';

const { SQLITE_DB_PATH, MASTRA_STORAGE_DB_NAME, MASTRA_VECTORS_DB_NAME } =
  process.env;

const name = 'Memory Agent';

const instructions = `
  You are a helpful assistant with memory capabilities.
  You can remember previous conversations and user preferences.
  When a user shares information about themselves, acknowledge it and remember it for future reference.
  If asked about something mentioned earlier in the conversation, recall it accurately.
`;

const model = gpt41;

const embedder = textEmbedding3Small;

const storage = new LibSQLStore({
  url: `file:${SQLITE_DB_PATH}${MASTRA_STORAGE_DB_NAME}`,
});

const vector = new LibSQLVector({
  connectionUrl: `file:${SQLITE_DB_PATH}${MASTRA_VECTORS_DB_NAME}`,
});

const workingMemoryTemplate = `
# User Profile

## Personal Info

- Name:
- Location:
- Timezone:

## Preferences

- Communication Style: [e.g., Formal, Casual]
- Interests:
- Favorite Topics:

## Session State

- Current Topic:
- Open Questions:
  - [Question 1]
  - [Question 2]
`;

/*
Working memory is particularly useful for:
- Personal assistants that need to remember user preferences
- Customer support agents that need to track issue details
- Educational agents that need to remember a student's progress
- Task-oriented agents that need to track the state of a complex task

By using working memory effectively, you can create agents that feel more personalized and attentive to user needs.

Best practices:
- Be selective about what goes into working memory
- Use clear instructions
- Design a thoughtful template
- Test thoroughly
*/

const memory = new Memory({
  embedder,
  storage,
  vector,
  options: {
    lastMessages: 20,
    // semanticRecall: false
    semanticRecall: {
      topK: 3,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
    workingMemory: {
      enabled: true,
      template: workingMemoryTemplate,
    },
    threads: {
      generateTitle: true,
    },
  },
});

// Create an agent with memory
export const memoryAgent = new Agent({
  name,
  instructions,
  model,
  memory,
});
