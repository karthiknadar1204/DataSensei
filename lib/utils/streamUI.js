import OpenAI from 'openai';

export async function streamUI({ messages, model, initialResponse, onProgress }) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Add JSON instruction to system message if not present
  const updatedMessages = messages.map(msg => {
    if (msg.role === 'system') {
      return {
        ...msg,
        content: `${msg.content}\nRespond with a JSON object following the specified format.`
      };
    }
    return msg;
  });

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4-turbo-preview',
    messages: updatedMessages,
    stream: true,
    response_format: { type: 'json_object' }
  });

  if (initialResponse && onProgress) {
    onProgress(initialResponse);
  }

  let fullResponse = '';

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    
    if (onProgress) {
      onProgress(content);
    }
  }

  try {
    return JSON.parse(fullResponse);
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return {
      error: 'Invalid response format',
      type: 'error'
    };
  }
} 