import { openaiClient } from '../utils/instructorClient';
import { traceable } from 'langsmith/traceable';
import { CombinedResearcherSchema } from '../schemas/responseSchemas';

export const researcher = traceable(async function researcher(messages) {
  // Check if it's a simple data query
  const userMessage = messages[messages.length - 1].content.toLowerCase();
  const isSimpleQuery = userMessage.includes('group') || 
                       userMessage.includes('count') || 
                       userMessage.includes('show') || 
                       userMessage.includes('list') || 
                       userMessage.includes('tell');

  const systemPrompt = {
    role: 'system',
    content: isSimpleQuery ? 
      `You are a data analyst that provides direct answers to data queries. Return results in this strict JSON format:
      {
        "type": "analysis",
        "content": {
          "summary": string,
          "details": string[],
          "metrics": {
            [key: string]: number | string
          }
        }
      }
      
      Return JSON format.` 
      : // Visualization-focused prompt
      `You are an AI research assistant that provides detailed analysis and insights based on database schema and data.

Return results in this strict JSON format:
{
  "type": "visualization", 
  "content": {
    "title": string,
    "summary": string,
    "details": string[],
    "metrics": {
      [key: string]: number | string
    }
  },
  "visualization": {
    "chartType": string,
    "data": [
      {
        "label": string,
        "value": number
      }
    ],
    "config": {
      "xAxis": {
        "label": string,
        "type": "category"
      },
      "yAxis": {
        "label": string,
        "type": "number"
      },
      "legend": boolean,
      "stacked": boolean
    }
  }
}

Return JSON format.`
  };

  try {
    // Use standard OpenAI client instead of Instructor for now
    const fallbackResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemPrompt, ...messages],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    
    return JSON.parse(fallbackResponse.choices[0].message.content);
  } catch (error) {
    console.error("Error in researcher agent:", error);
    
    // Return a simple error response in the expected format
    return {
      type: "analysis",
      content: {
        summary: "Error processing your request",
        details: ["There was an error processing your request. Please try again."],
        metrics: {}
      }
    };
  }
});