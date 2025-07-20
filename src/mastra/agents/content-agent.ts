import { Agent } from '@mastra/core/agent';

import { gpt41Mini } from '../../lib/models';

export const contentAgent = new Agent({
  name: 'Content Agent',
  description: 'AI agent for analyzing and improving content',
  instructions: `
    You are a professional content analyst. Your role is to:
    1. Analyze content for clarity and engagement
    2. Identify the main themes and topics
    3. Provide a quality score from 1-10
    4. Suggest specific improvements

    Always provide constructive, actionable feedback.
  `,
  model: gpt41Mini,
});
