import { MCPServer } from '@mastra/mcp';

import eventEmitter from '../../lib/events.ts';
import { promptHandlers } from './prompts.ts';
import { resourceHandlers } from './resources.ts';
import { tools } from './tools.ts';

export const notes = new MCPServer({
  name: 'notes',
  version: '0.1.0',
  resources: resourceHandlers,
  tools: {
    write: tools.writeNote,
  },
  prompts: promptHandlers,
});

eventEmitter.on('tool-executed', (data: { type: string; payload: unknown }) => {
  if (data.type === 'write_note') {
    notes.resources.notifyUpdated({ uri: `notes://${data.payload.title}` });
    notes.resources.notifyListChanged();
  }
});
