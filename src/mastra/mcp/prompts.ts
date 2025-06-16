import type { MCPServerPrompts } from '@mastra/mcp';
import matter from 'gray-matter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type { Node } from 'unist';

const prompts = [
  {
    name: 'new_daily_note',
    description:
      "Create a new daily note with today's date and standard sections.",
    version: '1.0.0',
  },
  {
    name: 'summarize_note',
    description: 'Give me a TL;DR of the note.',
    version: '1.0.0',
  },
  {
    name: 'brainstorm_ideas',
    description: 'Brainstorm new ideas based on a note.',
    version: '1.0.0',
  },
];

function stringifyNode(node: Node): string {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child: Node) => stringifyNode(child)).join('');
  }
  return '';
}

export interface NoteMeta {
  title: string;
  headings: string[];
  wordCounts: Record<string, number>;
  tags: string[];
}

export async function analyzeMarkdown(md: string): Promise<NoteMeta> {
  const { data, content } = matter(md);
  const tree = unified().use(remarkParse).parse(content);

  const headings: string[] = [];
  const wordCounts: Record<string, number> = {};

  let currentHeading = 'untitled';
  wordCounts[currentHeading] = 0;

  for (const node of tree.children) {
    if (node.type === 'heading' && node.depth === 2) {
      currentHeading = stringifyNode(node);
      headings.push(currentHeading);
      wordCounts[currentHeading] = 0;
    } else {
      const textContent = stringifyNode(node);
      if (textContent.trim()) {
        wordCounts[currentHeading] =
          (wordCounts[currentHeading] || 0) + textContent.split(/\s+/).length;
      }
    }
  }

  return {
    title: headings[0] ?? 'untitled',
    headings,
    wordCounts,
    tags: data.tags ?? [],
  };
}

const getPromptMessages: MCPServerPrompts['getPromptMessages'] = async ({
  name,
  args,
}) => {
  const prompt = prompts.find((p) => p.name === name);
  if (!prompt) {
    throw new Error(`Prompt "${name}" not found`);
  }

  switch (name) {
    case 'new_daily_note': {
      const today = new Date().toISOString().split('T')[0];
      return [
        {
          role: 'user' as const,
          content: {
            type: 'text',
            text: `Create a new note titled "${today}" with the following sections: "## Tasks", "## Meetings", "## Notes".`,
          },
        },
      ];
    }
    case 'summarize_note': {
      if (!args.noteContent) {
        throw new Error('No content provided to be analyzed');
      }
      const meta = await analyzeMarkdown(args.noteContent);
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
    Summarize each section in ≤ 3 bullets keeping the same order.

    ### Outline
    ${meta.headings.map((h: string) => `- ${h} (${meta.wordCounts[h] || 0} words)`).join('\n')}
        `.trim(),
          },
        },
      ];
    }
    case 'brainstorm_ideas': {
      if (!args.noteContent) {
        throw new Error('No content provided to be analyzed');
      }
      const meta = await analyzeMarkdown(args.noteContent);
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `
  Brainstorm 3 fresh ideas **for each underdeveloped section** below
  ${args?.topic ? `with an emphasis on ${args.topic}.` : '.'}

  Underdeveloped sections:
  ${meta.headings.length ? meta.headings.map((h: string) => `- ${h}`).join('\n') : '- (none, pick any)'}`,
          },
        },
      ];
    }
    default:
      throw new Error(`Prompt "${name}" not found`);
  }
};

export const promptHandlers: MCPServerPrompts = {
  listPrompts: async () => prompts,
  getPromptMessages: getPromptMessages,
};
