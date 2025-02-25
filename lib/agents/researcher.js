import { client } from './index';
import { traceable } from 'langsmith/traceable';

export const researcher = traceable(async function researcher(messages) {
  const systemPrompt = {
    role: 'system',
    content: `You are an AI research assistant that provides detailed analysis and insights based on database schema and data.

Your role is to analyze the provided database context and return a JSON object in the following strict format:

{
  "type": "visualization",
  "content": {
    "title": string,       // Chart title
    "summary": string,     // Brief overview of findings
    "details": string[],   // Detailed bullet points of insights
    "metrics": {           // Key numerical findings
      [key: string]: number | string
    }
  },
  "visualization": {
    "chartType": string,   // "bar" | "line" | "pie" | "scatter"
    "data": [              // Consistent data format for all chart types
      {
        "label": string,   // X-axis label or category name
        "value": number,   // Y-axis value or metric
        "group": string    // Optional: For grouped data (e.g., multiple lines)
      }
    ],
    "config": {
      "xAxis": {
        "label": string,
        "type": string    // "category" | "time" | "number"
      },
      "yAxis": {
        "label": string,
        "type": string    // "number" | "percentage"
      },
      "legend": boolean,  // Whether to show legend
      "stacked": boolean  // For bar/area charts
    }
  }
}

If the user requests a visualization but doesn't specify the chart type, respond with:
{
  "type": "clarification",
  "content": {
    "question": "What type of visualization would you prefer?",
    "options": [
      {
        "type": "bar",
        "description": "Bar charts are great for comparing quantities across categories"
      },
      {
        "type": "line",
        "description": "Line graphs show trends and changes over time"
      },
      {
        "type": "pie",
        "description": "Pie charts display parts of a whole or composition"
      },
      {
        "type": "scatter",
        "description": "Scatter plots reveal relationships between two variables"
      }
    ]
  }
}

For clear visualization requests or after clarification, return:
{
  "type": string,         // "analysis" | "visualization" | "calculation"
  "content": {
    "summary": string,    // Brief overview of findings
    "details": string[],  // Detailed bullet points of insights
    "metrics": {          // Key numerical findings (if applicable)
      [key: string]: number | string
    }
  },
  "visualization": {      // Only included if visualization is needed
    "chartType": string,  // "bar" | "line" | "pie" | "scatter"
    "data": array,        // Sample data structure for visualization
    "xAxis": string,      // X-axis label
    "yAxis": string       // Y-axis label
  }
}

Consider the provided database schema and sample data when analyzing:
- Reference only columns and tables that exist in the schema
- Use sample data to provide meaningful insights
- Structure response based on available data
- If visualization type is ambiguous, ask for clarification

For MongoDB:
- Collections are analogous to tables, and documents are analogous to rows.
- Use the inferred schema to understand the structure of documents.
- Handle nested documents and arrays appropriately.
- Consider the flexibility of MongoDB's schema when analyzing data.`
  };

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [systemPrompt, ...messages],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  return JSON.parse(response.choices[0].message.content);
});
