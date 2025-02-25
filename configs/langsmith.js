import { Client } from "langsmith";
import { OpenAI } from 'openai';
import { wrapOpenAI } from 'langsmith/wrappers';
import { traceable } from 'langsmith/traceable';

// Initialize LangSmith client with proper configuration
export const langsmithClient = new Client({
  apiUrl: process.env.LANGSMITH_ENDPOINT,
  apiKey: process.env.LANGSMITH_API_KEY,
  projectName: process.env.LANGSMITH_PROJECT
});

// Create wrapped OpenAI client for auto-tracing
export const openaiClient = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

// Optimized traceable wrapper
export function enhancedTraceable(name, fn) {
  return traceable(async function wrapped(...args) {
    const result = await fn.apply(this, args);
    return result;
  }, {
    name,
    tags: [`function:${name}`],
    // Disable detailed run logging for better performance
    runNamePrefix: null,
    skipRunLogging: process.env.NODE_ENV === 'production'
  });
} 