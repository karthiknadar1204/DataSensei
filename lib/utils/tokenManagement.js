import { get_encoding } from "tiktoken";

const EMBEDDING_MODEL_TOKENS = 8191;  // text-embedding-ada-002 limit
const COMPLETION_MODEL_TOKENS = 16385; // gpt-4-turbo-preview limit
const MAX_TOKENS_PER_REQUEST = 8000;  // Safe limit for API requests

export function countTokens(text) {
  const encoding = get_encoding("cl100k_base");
  const tokens = encoding.encode(text);
  const count = tokens.length;
  encoding.free();
  return count;
}

export function chunkEmbeddingContent(content) {
  const encoding = get_encoding("cl100k_base");
  const tokens = encoding.encode(content);
  
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;
  
  for (const token of tokens) {
    if (currentLength + 1 > EMBEDDING_MODEL_TOKENS) {
      // Find a good breaking point (period, newline, or comma)
      let breakPoint = currentChunk.length;
      const decodedChunk = encoding.decode(new Uint32Array(currentChunk));
      const lastPeriod = decodedChunk.lastIndexOf('.');
      const lastNewline = decodedChunk.lastIndexOf('\n');
      const lastComma = decodedChunk.lastIndexOf(',');
      
      if (lastPeriod > decodedChunk.length * 0.5) breakPoint = lastPeriod + 1;
      else if (lastNewline > decodedChunk.length * 0.5) breakPoint = lastNewline + 1;
      else if (lastComma > decodedChunk.length * 0.5) breakPoint = lastComma + 1;
      
      chunks.push(encoding.decode(new Uint32Array(currentChunk.slice(0, breakPoint))));
      currentChunk = currentChunk.slice(breakPoint);
      currentLength = currentChunk.length;
    }
    currentChunk.push(token);
    currentLength++;
  }
  
  if (currentChunk.length > 0) {
    chunks.push(encoding.decode(new Uint32Array(currentChunk)));
  }
  
  encoding.free();
  return chunks;
}

export function truncateToTokenLimit(messages, maxTokens = MAX_TOKENS_PER_REQUEST) {
  const encoding = get_encoding("cl100k_base");
  
  // Reserve tokens for system message and response
  const systemMessageBuffer = 500;
  const responseBuffer = 1000;
  const availableTokens = maxTokens - systemMessageBuffer - responseBuffer;
  
  let totalTokens = 0;
  const truncatedMessages = [];
  
  // Always include system message if present
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage) {
    const systemTokens = encoding.encode(JSON.stringify(systemMessage)).length;
    totalTokens += systemTokens;
    truncatedMessages.push(systemMessage);
  }
  
  // Process remaining messages in reverse (newest first)
  const nonSystemMessages = messages
    .filter(m => m.role !== 'system')
    .reverse();
  
  for (const message of nonSystemMessages) {
    const messageContent = typeof message.content === 'string' 
      ? message.content 
      : JSON.stringify(message.content);
    
    const messageTokens = encoding.encode(messageContent).length;
    
    if (totalTokens + messageTokens <= availableTokens) {
      truncatedMessages.unshift(message);
      totalTokens += messageTokens;
    } else {
      // Try to include partial content for the last message
      if (message.role === 'user') {
        const remainingTokens = availableTokens - totalTokens;
        if (remainingTokens > 100) { // Only include if we have meaningful space
          const partialContent = smartTruncateText(messageContent, remainingTokens, encoding);
          if (partialContent) {
            truncatedMessages.unshift({
              ...message,
              content: partialContent,
              truncated: true
            });
          }
        }
      }
      break;
    }
  }
  
  encoding.free();
  return truncatedMessages;
}

function smartTruncateText(text, maxTokens, encoding) {
  const tokens = encoding.encode(text);
  if (tokens.length <= maxTokens) return text;
  
  // Try to find a good breaking point
  const truncatedTokens = tokens.slice(0, maxTokens);
  const decoded = encoding.decode(truncatedTokens);
  
  // Find the last complete sentence or clause
  const lastPeriod = decoded.lastIndexOf('.');
  const lastNewline = decoded.lastIndexOf('\n');
  const lastComma = decoded.lastIndexOf(',');
  
  let breakPoint = decoded.length;
  if (lastPeriod > decoded.length * 0.7) breakPoint = lastPeriod + 1;
  else if (lastNewline > decoded.length * 0.7) breakPoint = lastNewline + 1;
  else if (lastComma > decoded.length * 0.7) breakPoint = lastComma + 1;
  
  return decoded.slice(0, breakPoint) + '...';
}

export function chunkTableData(tableData) {
  const CHUNK_SIZE = 4000; // Similar to Python's approach
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;
  
  // Helper to estimate the size of a row
  const getRowSize = (row) => JSON.stringify(row).length;
  
  // Process table data row by row
  for (const row of tableData) {
    const rowSize = getRowSize(row);
    
    if (currentSize + rowSize > CHUNK_SIZE) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      currentChunk = [row];
      currentSize = rowSize;
    } else {
      currentChunk.push(row);
      currentSize += rowSize;
    }
  }
  
  // Add any remaining data
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}