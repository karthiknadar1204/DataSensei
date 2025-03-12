"use server";

import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { index } from "@/lib/pinecone";
import { db } from "@/configs/db";
import { eq, and } from "drizzle-orm";
import { chats, dbConnections } from "@/configs/schema";
import { chunkTableData } from "@/lib/utils/tokenManagement";
import Instructor from "@instructor-ai/instructor";
import { QueryEmbeddingsSchema } from "@/lib/schemas/embeddingSchemas";

const CHUNK_SIZE = 4000;

function chunkData(data) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const table of data) {
    const tableString = JSON.stringify(table);
    const tableSize = tableString.length;

    if (currentSize + tableSize > CHUNK_SIZE) {
      chunks.push(currentChunk);
      currentChunk = [table];
      currentSize = tableSize;
    } else {
      currentChunk.push(table);
      currentSize += tableSize;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function embeddings(data) {
  console.log('Starting embeddings process for connection ID:', data.id);
  const user = await currentUser();
  if (!user) return null;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    console.log(`Processing ${(data.tables || data.collections)?.length || 0} tables/collections`);
    const schemaText = (data.tables || data.collections).map(t => ({
      tableName: t.tableName || t.collectionName,
      columns: t.columns.map(c => `${c.column_name} (${c.data_type})`).join(', ')
    }));

    console.log('Schema text sample:', JSON.stringify(schemaText.slice(0, 2)));

    // Schema embedding remains unchanged
    const schemaEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(schemaText)
    });
    console.log('Schema embedding created successfully');

    // Generate embeddings for each table's chunks
    async function* generateTableChunks() {
      for (const table of data.tables || data.collections) {
        const tableName = table.tableName || table.collectionName;
        console.log(`Processing table: ${tableName} with ${table.data?.length || 0} rows`);
        
        const chunks = chunkTableData(table.data);
        console.log(`Table ${tableName}: Created ${chunks.length} chunks`);

        for (let i = 0; i < chunks.length; i++) {
          console.log(`Processing chunk ${i+1}/${chunks.length} for table ${tableName}`);
          const chunkData = {
            tableName,
            entries: chunks[i]
          };

          const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: JSON.stringify(chunkData)
          });
          console.log(`Created embedding for ${tableName} chunk ${i+1}`);

          yield {
            id: `data-${String(data.id)}-${tableName}-${i}`,
            values: embedding.data[0].embedding,
            metadata: {
              type: 'data',
              connectionId: String(data.id),
              connectionName: data.connectionName,
              dbType: data.dbType,
              tableName,
              chunkIndex: i,
              timestamp: new Date().toISOString(),
              data: JSON.stringify(chunkData)
            }
          };
        }
      }
    }

    const BATCH_SIZE = 10;
    let batch = [];
    let batchCount = 0;
    
    for await (const embeddingData of generateTableChunks()) {
      batch.push(embeddingData);
      if (batch.length >= BATCH_SIZE) {
        await index.upsert(batch);
        batchCount++;
        console.log(`Upserted batch ${batchCount} with ${batch.length} embeddings to Pinecone`);
        batch = [];
      }
    }
    
    if (batch.length > 0) {
      await index.upsert(batch);
      batchCount++;
      console.log(`Upserted final batch ${batchCount} with ${batch.length} embeddings to Pinecone`);
    }


    await index.upsert([{
      id: `schema-${data.id}`,
      values: schemaEmbedding.data[0].embedding,
      metadata: {
        type: 'schema',
        connectionId: String(data.id),
        schema: JSON.stringify(schemaText)
      }
    }]);
    console.log('Schema embedding upserted to Pinecone');

    console.log('Embeddings process completed successfully');
    return true;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw error;
  }
}

export async function getDbData(id) {
  const data = await db.select().from(dbConnections).where(eq(dbConnections.id, id));
  return data;
}

export async function getQueryEmbeddings(message, connectionId) {
  console.log(`Getting query embeddings for message: "${message.substring(0, 50)}..." and connection ID: ${connectionId}`);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message
    });
    console.log('Question embedding created successfully');

    const queryResult = await index.query({
      vector: questionEmbedding.data[0].embedding,
      filter: { connectionId: String(connectionId) },
      topK: 15,
      includeMetadata: true
    });
    console.log(`Retrieved ${queryResult.matches?.length || 0} matches from Pinecone`);

    // Process results
    const matches = queryResult.matches || [];
    console.log('Match scores:', matches.map(m => ({
      id: m.id,
      score: m.score,
      type: m.metadata?.type
    })));

    const schemaInfo = matches.find(m => m.metadata?.type === 'schema')?.metadata?.schema;
    const dataChunks = matches
      .filter(m => m.metadata?.type === 'data')
      .map(m => {
        try {
          return JSON.parse(m.metadata?.data);
        } catch (e) {
          console.error('Error parsing metadata:', e);
          return null;
        }
      })
      .filter(Boolean);
    
    console.log(`Found ${dataChunks.length} valid data chunks`);

    // Reconstruct rows from PK-attribute pairs
    const reconstructedData = [];
    const rowsByTable = {};

    dataChunks.forEach(chunk => {
      const tableName = chunk.tableName;
      rowsByTable[tableName] = rowsByTable[tableName] || {};
      
      // If using the new PK-attribute format
      if (chunk.entries && chunk.entries[0]?.pk) {
        console.log(`Processing PK-attribute format for table ${tableName} with ${chunk.entries.length} entries`);
        chunk.entries.forEach(entry => {
          const pkKey = JSON.stringify(entry.pk);
          rowsByTable[tableName][pkKey] = rowsByTable[tableName][pkKey] || { ...entry.pk };
          Object.assign(rowsByTable[tableName][pkKey], entry.attribute);
        });
      } else if (Array.isArray(chunk.entries)) {
        // Handle legacy format
        console.log(`Processing legacy format for table ${tableName} with ${chunk.entries.length} entries`);
        chunk.entries.forEach(row => {
          const rowKey = JSON.stringify(row);
          rowsByTable[tableName][rowKey] = row;
        });
      }
    });

    // Convert reconstructed rows back to arrays for each table
    Object.entries(rowsByTable).forEach(([tableName, rows]) => {
      const rowsArray = Object.values(rows);
      console.log(`Reconstructed ${rowsArray.length} rows for table ${tableName}`);
      reconstructedData.push({
        tableName,
        sampleData: rowsArray
      });
    });

    // Create the result object
    const result = {
      schema: schemaInfo ? JSON.parse(schemaInfo) : [],
      sampleData: reconstructedData
    };
    
    console.log('Final result structure:', {
      schemaCount: result.schema.length,
      sampleDataCount: result.sampleData.length,
      sampleDataSizes: result.sampleData.map(t => ({
        table: t.tableName,
        rowCount: t.sampleData.length
      }))
    });

    // Validate the result against the schema
    try {
      // This will throw an error if validation fails
      return QueryEmbeddingsSchema.parse(result);
    } catch (validationError) {
      console.error('Schema validation error:', validationError);
      
      // If validation fails, return the original result
      // This ensures backward compatibility
      return result;
    }
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

export async function getChatHistory(connectionId) {
  const chatHistory = await db
    .select()
    .from(chats)
    .where(eq(chats.connectionId, connectionId))
    .orderBy(chats.createdAt);

  if (!chatHistory.length) return [];

  return chatHistory[0].conversation.map(chat => {
    const parsedResponse = JSON.parse(chat.response);
    return {
      id: Date.now(),
      message: chat.message,
      response: parsedResponse.type === "analysis" ? parsedResponse.data : parsedResponse,
      timestamp: chat.timestamp,
      connectionId
    };
  });
}