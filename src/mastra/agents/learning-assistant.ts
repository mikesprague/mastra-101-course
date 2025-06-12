// src/mastra/agents/learning-assistant.ts
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

const { SQLITE_DB_PATH, MASTRA_STORAGE_DB_NAME, MASTRA_VECTORS_DB_NAME } =
  process.env;

import { gpt41, textEmbedding3Small } from '../../lib/models';

const name = 'Learning Assistant';

const instructions = `
  You are a personal learning assistant that helps users learn new skills and tracks their progress.

  ## Your Capabilities

  - You help users set learning goals and track their progress
  - You provide explanations and resources tailored to their skill level
  - You remember what topics they're learning and their progress in each
  - You adapt your teaching style to match their learning preferences

  ## Guidelines for Using Memory

  - When the user shares information about their learning style or preferences,
    update your working memory.

  - When the user asks about a topic they've mentioned before, use your semantic
    recall to provide continuity in your teaching.

  - When explaining concepts, check your working memory to understand their
    current skill level and provide an explanation at the appropriate depth.

  Always be encouraging and supportive. Focus on building the user's confidence
  and celebrating their progress.
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
# Learner Profile

## Personal Info
- Name:
- Learning Style: [Visual, Auditory, Reading/Writing, Kinesthetic]

## Learning Journey
- Current Topics:
  - [Topic 1]:
    - Skill Level: [Beginner, Intermediate, Advanced]
    - Started: [Date]
    - Goals:
    - Resources:
    - Progress Notes:
  - [Topic 2]:
    - Skill Level: [Beginner, Intermediate, Advanced]
    - Started: [Date]
    - Goals:
    - Resources:
    - Progress Notes:

## Session State
- Current Focus:
- Questions to Revisit:
- Recommended Next Steps:
`;

const memory = new Memory({
  embedder,
  storage,
  vector,
  options: {
    lastMessages: 20,
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
  },
});

/*
Memory Best Practices

As you build memory-enhanced agents, keep these best practices in mind:

- Be selective about what goes into working memory
- Use clear instructions
- Choose appropriate memory parameters
- Consider privacy implications
- Test thoroughly
- Design thoughtful templates
- Balance memory types

By following these best practices, you can create memory-enhanced agents that provide truly personalized and contextual experiences while avoiding common pitfalls.
*/

export const learningAssistantAgent = new Agent({
  name,
  instructions,
  model,
  memory,
});
