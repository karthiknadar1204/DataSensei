import { openaiClient } from '../utils/instructorClient';
import { traceable } from 'langsmith/traceable';
import { TaskManagerSchema } from '../schemas/responseSchemas';

export const taskManager = traceable(async function taskManager(messages) {
  // Check if it's an SQL query request
  const userMessage = messages[messages.length - 1].content.toLowerCase();
  const isSqlRequest = userMessage.includes('sql query') || 
                      userMessage.includes('write sql') || 
                      userMessage.includes('generate sql') ||
                      userMessage.includes('sql statement') ||
                      userMessage.includes('sql code');

  // If it's an SQL request, return analyze directly
  if (isSqlRequest) {
    return {
      next: "analyze",
      reason: "User requested SQL query generation"
    };
  }

  const systemPrompt = {
    role: 'system',
    content: `You are an AI task manager that determines the next action based on user input and database context.
    
Your role is to analyze the user's request along with the provided database schema and sample data context to return a JSON object with the following structure:
{
  "next": string,    // The next action to take: "inquire" | "visualize" | "analyze"
  "reason": string   // Brief explanation of why this action was chosen
}

Decision Logic:
1. If the request needs clarification or is too vague:
   { "next": "inquire", "reason": "Need more specific information about..." }

2. If the request involves data visualization or trends:
   { "next": "visualize", "reason": "User requested visual representation of..." }

3. For all other data analysis, insights, or information requests:
   { "next": "analyze", "reason": "User requested analysis of..." }

Consider the provided database schema and sample data when making decisions:
- Check if requested columns/tables exist in the schema
- Verify if sample data supports the requested analysis
- Request clarification if the query cannot be mapped to available data

Examples:
- "Show me sales trends": { "next": "visualize", "reason": "User requested visual trend analysis of sales data" }
- "What's our revenue": { "next": "analyze", "reason": "User requested revenue analysis from available data" }
- "Compare departments": { "next": "analyze", "reason": "User requested comparative analysis between departments" }
- "Growth rate": { "next": "inquire", "reason": "Need to clarify timeframe and specific metrics for growth calculation" }

Return JSON format.`
  };

  try {
    // Use standard OpenAI client instead of Instructor for now
    const fallbackResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemPrompt, ...messages],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });
    
    return JSON.parse(fallbackResponse.choices[0].message.content);
  } catch (error) {
    console.error("Error in task manager:", error);
    
    // Return a simple error response in the expected format
    return {
      next: "analyze",
      reason: "Defaulting to analysis due to error in task determination"
    };
  }
});