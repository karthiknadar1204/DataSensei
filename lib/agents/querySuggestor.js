import { openaiClient } from '../utils/instructorClient';
import { traceable } from 'langsmith/traceable';
import { QuerySuggestorSchema } from '../schemas/responseSchemas';

export const querySuggestor = traceable(async function querySuggestor(messages) {
  const systemPrompt = {
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

Return JSON format.`
  };

  try {
    // Use standard OpenAI client instead of Instructor for now
    const fallbackResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemPrompt, ...messages],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    
    return JSON.parse(fallbackResponse.choices[0].message.content);
  } catch (error) {
    console.error("Error in query suggestor:", error);
    
    // Return a simple error response in the expected format
    return {
      related: ["Could you tell me more about the data?", "What other information would you like to know?", "How can I help you analyze this data?"],
      categories: {
        deeper: ["What specific aspects are you interested in?", "Would you like more detailed information?"],
        broader: ["Would you like to see an overview of all available data?", "Are there other datasets you'd like to explore?"],
        actionable: ["Would you like recommendations based on this data?", "Would you like to see visualizations of this data?"]
      }
    };
  }
});