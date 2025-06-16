import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import eventEmitter from '../../lib/events.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NOTES_DIR = path.resolve(__dirname, '../../../notes');

export const writeNote = createTool({
  id: 'write_note',
  description: 'Write a new note or overwrite an existing one.',
  inputSchema: z.object({
    title: z
      .string()
      .describe('The title of the note. This will be the filename.'),
    content: z.string().describe('The markdown content of the note.'),
  }),
  execute: async ({ context }) => {
    try {
      const { title, content } = context;
      const filePath = path.join(NOTES_DIR, `${title}.md`);
      await fs.mkdir(NOTES_DIR, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');

      eventEmitter.emit('tool-executed', {
        type: 'write_note',
        payload: { title },
      });

      return `Successfully wrote to note "${title}".`;
    } catch (error: unknown) {
      return `Error writing note: ${error.message}`;
    }
  },
});

export const tools = {
  writeNote,
};
