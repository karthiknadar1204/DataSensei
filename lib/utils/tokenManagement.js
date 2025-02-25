
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