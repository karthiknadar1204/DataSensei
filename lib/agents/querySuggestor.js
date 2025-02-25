import { client } from './index';
import { traceable } from 'langsmith/traceable';

export const querySuggestor = traceable(async function querySuggestor(messages) {
  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an AI that suggests relevant follow-up queries based on the user's current request.

Your role is to return a JSON object with the following structure:
{
  "related": string[],     // Array of 3-5 related queries
  "categories": {          // Grouped suggestions by category
    "deeper": string[],    // 2-3 queries that dive deeper into the current topic
    "broader": string[],   // 2-3 queries that explore related areas
    "actionable": string[] // 2-3 queries that lead to specific actions/decisions
  }
}

Guidelines:
1. Suggestions should be specific and actionable
2. Include a mix of analytical and practical queries
3. Ensure suggestions build upon the context of the original query
4. Use natural, conversational language

Examples:
- Original query about sales performance:
{
  "related": [
    "What were our top 3 performing products this quarter?",
    "How do our sales compare to the same period last year?",
    "Which sales channels are showing the strongest growth?",
    "What's the average transaction value trend?"
  ],
  "categories": {
    "deeper": [
      "What factors are driving the current sales trend?",
      "How do seasonal patterns affect our sales performance?"
    ],
    "broader": [
      "How does our market share compare to competitors?",
      "What customer segments are growing fastest?"
    ],
    "actionable": [
      "Which products should we promote more aggressively?",
      "Where should we focus our sales team efforts?"
    ]
  }
}`
      },
      ...messages
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  return JSON.parse(response.choices[0].message.content);
});
