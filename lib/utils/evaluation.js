import { Client } from "langsmith";
import { OpenAI } from 'openai';
import { runInBackground } from './backgroundTask';

// Initialize clients if not imported
const langsmithClient = process.env.LANGSMITH_API_KEY ? new Client({
  apiUrl: process.env.LANGSMITH_ENDPOINT,
  apiKey: process.env.LANGSMITH_API_KEY,
  projectName: process.env.LANGSMITH_PROJECT
}) : null;

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const evaluationInstructions = `Evaluate AI Response against Expected Format and User Query.
Key evaluation criteria:
- Accuracy: Does the response provide correct information?
- Format: Does it follow the expected JSON structure?
- Relevance: Does it address the user's query?
- Completeness: Are all required components present?

Return evaluation as JSON with structure:
{
  "score": number,          // Overall score (0-1)
  "format_adherence": boolean,  // True if matches expected format
  "relevance_score": number,    // How relevant to query (0-1)
  "completeness_score": number, // How complete the response is (0-1)
  "feedback": string[]          // Specific feedback points
}`;

export async function evaluateResponse({
  userInput,
  aiResponse,
  expectedFormat,
  context
}) {
  return runInBackground(async () => {
    try {
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: evaluationInstructions
          },
          { 
            role: "user", 
            content: `Evaluate this response:
User Query: ${userInput}
AI Response: ${JSON.stringify(aiResponse)}
Expected Format: ${expectedFormat}
Context: ${context}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const evaluation = JSON.parse(response.choices[0].message.content);

      // Only create LangSmith run if client is available
      if (langsmithClient) {
        await langsmithClient.createRun({
          name: "response_evaluation",
          run_type: "chain",
          inputs: {
            user_input: userInput,
            context: context,
            expected_format: expectedFormat
          },
          outputs: {
            ai_response: aiResponse,
            evaluation_result: evaluation
          },
          scores: {
            overall_score: evaluation.score,
            format_score: evaluation.format_adherence ? 1 : 0,
            relevance_score: evaluation.relevance_score,
            completeness_score: evaluation.completeness_score
          },
          tags: ["evaluation", "response_quality"]
        });
      }

      return evaluation;
    } catch (error) {
      console.error('Evaluation error:', error);
    }
  });
} 