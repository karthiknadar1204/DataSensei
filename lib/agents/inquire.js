import { client } from './index';
import { traceable } from 'langsmith/traceable';

export const inquire = traceable(async function inquire(messages) {
  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant that generates follow-up questions to gather necessary details from users.

Your role is to return a JSON object with the following structure:
{
  "question": string,     // The main follow-up question
  "context": string,      // Brief explanation of why this information is needed
  "options": string[],    // 3-4 most relevant suggested options
  "allowCustomInput": boolean,  // Whether to allow free-form input besides options
  "inputType": string     // Suggested input type: "select", "text", "number", "date"
}

Guidelines:
1. Questions should be specific and focused
2. Options should cover the most common scenarios
3. Provide context to help users understand why the information is needed
4. Use appropriate input types based on the expected response

Examples:
- Vague request about sales:
{
  "question": "What timeframe would you like to analyze the sales data for?",
  "context": "This will help provide relevant sales metrics and trends",
  "options": ["Last 30 days", "Last quarter", "Year to date", "Custom range"],
  "allowCustomInput": true,
  "inputType": "select"
}

- Unclear analysis request:
{
  "question": "Which specific metrics would you like to analyze?",
  "context": "This will ensure the analysis focuses on the most relevant data points",
  "options": ["Revenue growth", "Customer acquisition", "Product performance", "Market share"],
  "allowCustomInput": true,
  "inputType": "select"
}`
      },
      ...messages
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  return JSON.parse(response.choices[0].message.content);
});
