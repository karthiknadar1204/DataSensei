import { openaiClient } from '../utils/instructorClient';
import { traceable } from 'langsmith/traceable';
import { InquireSchema } from '../schemas/responseSchemas';

export const inquire = traceable(async function inquire(messages) {
  const systemPrompt = {
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
    console.error("Error in inquire agent:", error);
    
    // Return a simple error response in the expected format
    return {
      question: "Could you please provide more details?",
      context: "I need more information to process your request correctly.",
      options: ["Yes, I'll provide more details", "Let me rephrase my question", "I need help understanding what information you need"],
      allowCustomInput: true,
      inputType: "text"
    };
  }
});