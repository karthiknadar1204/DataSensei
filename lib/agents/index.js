import { OpenAI } from 'openai';
import { wrapOpenAI } from 'langsmith/wrappers';

// Create wrapped OpenAI client for auto-tracing
export const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

export * from './taskManager';
export * from './inquire';
export * from './querySuggestor';
export * from './researcher';
