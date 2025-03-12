import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai";

// Create the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create the Instructor-enhanced client
export const instructorClient = Instructor(openai, {
  mode: "FUNCTIONS"
});

// Export the original OpenAI client as well
export const openaiClient = openai;