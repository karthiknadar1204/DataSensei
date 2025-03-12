export function chunkTableData(tableData) {
  console.log(`Starting chunking process for ${tableData.length} rows`);
  const CHUNK_SIZE = 4000;
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;
  
  // Try to identify potential primary key columns
  const potentialPkColumns = identifyPotentialPrimaryKeys(tableData);
  console.log(`Identified potential primary keys: ${potentialPkColumns.join(', ') || 'None found'}`);
  
  if (potentialPkColumns.length === 0) {
    console.log('No primary keys identified, using fallback chunking');
    return fallbackChunking(tableData);
  }
  
  // Create PK-attribute pairs for more efficient chunking
  for (const row of tableData) {
    // Extract primary key values
    const pk = potentialPkColumns.reduce((acc, col) => ({ ...acc, [col]: row[col] }), {});
    
    // Process each attribute as a separate entry with its PK
    for (const [column, value] of Object.entries(row)) {
      // Skip PK columns as separate entries
      if (potentialPkColumns.includes(column)) continue;
      
      const entry = { 
        pk, 
        attribute: { [column]: value } 
      };
      
      const entrySize = JSON.stringify(entry).length;
      
      // Handle oversized individual entries
      if (entrySize > CHUNK_SIZE) {
        console.warn(`Oversized entry (${entrySize} bytes) detected for column ${column}`);
        chunks.push([entry]);
        continue;
      }
      
      // Start a new chunk if current one would exceed size limit
      if (currentSize + entrySize > CHUNK_SIZE) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          console.log(`Created chunk #${chunks.length} with ${currentChunk.length} entries (${currentSize} bytes)`);
        }
        currentChunk = [entry];
        currentSize = entrySize;
      } else {
        currentChunk.push(entry);
        currentSize += entrySize;
      }
    }
  }
  
  // Add any remaining entries
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
    console.log(`Created final chunk #${chunks.length} with ${currentChunk.length} entries (${currentSize} bytes)`);
  }
  
  console.log(`Chunking complete: Created ${chunks.length} chunks`);
  console.log(`First chunk sample:`, JSON.stringify(chunks[0]?.slice(0, 2) || []));
  
  return chunks;
}

// Helper function to identify potential primary key columns
function identifyPotentialPrimaryKeys(tableData) {
  if (!tableData || tableData.length === 0) return [];
  
  // Check for common primary key column names
  const commonPkNames = ['id', 'ID', '_id', 'uuid', 'key'];
  
  // Find columns that have unique values across all rows
  const columnCounts = {};
  const uniqueValueColumns = [];
  
  // Initialize with all column names from first row
  const firstRow = tableData[0];
  Object.keys(firstRow).forEach(col => {
    columnCounts[col] = new Set();
  });
  
  // Count unique values for each column
  tableData.forEach(row => {
    Object.entries(row).forEach(([col, val]) => {
      if (columnCounts[col]) {
        columnCounts[col].add(JSON.stringify(val));
      }
    });
  });
  
  // Find columns with unique values
  Object.entries(columnCounts).forEach(([col, values]) => {
    if (values.size === tableData.length) {
      uniqueValueColumns.push(col);
    }
  });
  
  // Prioritize common PK names that are also unique
  const prioritizedColumns = uniqueValueColumns.filter(col => 
    commonPkNames.some(pkName => col.toLowerCase().includes(pkName.toLowerCase()))
  );
  
  console.log('Column uniqueness analysis:', Object.fromEntries(
    Object.entries(columnCounts).map(([col, values]) => [col, values.size])
  ));
  
  // Return prioritized columns first, then any unique columns
  return prioritizedColumns.length > 0 
    ? prioritizedColumns 
    : uniqueValueColumns.length > 0 
      ? [uniqueValueColumns[0]] 
      : [];
}

// Fallback chunking method for when no PK can be identified
function fallbackChunking(tableData) {
  console.log('Using fallback chunking method');
  const CHUNK_SIZE = 4000;
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;
  
  for (const row of tableData) {
    const rowSize = JSON.stringify(row).length;
    
    // If this row would exceed chunk size, start a new chunk
    if (currentSize + rowSize > CHUNK_SIZE) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        console.log(`Created fallback chunk #${chunks.length} with ${currentChunk.length} rows (${currentSize} bytes)`);
      }
      currentChunk = [row];
      currentSize = rowSize;
    } else {
      currentChunk.push(row);
      currentSize += rowSize;
    }
  }
  
  // Add any remaining rows
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
    console.log(`Created final fallback chunk #${chunks.length} with ${currentChunk.length} rows (${currentSize} bytes)`);
  }
  
  console.log(`Fallback chunking complete: Created ${chunks.length} chunks`);
  console.log(`First fallback chunk sample:`, JSON.stringify(chunks[0]?.slice(0, 2) || []));
  
  return chunks;
}