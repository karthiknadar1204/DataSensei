"use server";

import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { index } from "@/lib/pinecone";
import { db } from "@/configs/db";
import { eq, and } from "drizzle-orm";
import { chats, dbConnections } from "@/configs/schema";
import { chunkTableData } from "@/lib/utils/tokenManagement";

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
  const user = await currentUser();
  if (!user) return null;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const schemaText = (data.tables || data.collections).map(t => ({
      tableName: t.tableName || t.collectionName,
      columns: t.columns ? t.columns.map(c => `${c.column_name} (${c.data_type})`).join(', ') : t.schema.map(c => `${c.column_name} (${c.data_type})`).join(', ')
    }));

    const schemaEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(schemaText)
    });

    async function* generateTableChunks() {
      for (const table of data.tables) {
        const chunks = chunkTableData(table.data);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunkData = {
            tableName: table.tableName,
            sampleData: chunks[i]
          };

          const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: JSON.stringify(chunkData)
          });

          yield {
            id: `data-${String(data.id)}-${table.tableName}-${i}`,
            values: embedding.data[0].embedding,
            metadata: {
              type: 'data',
              connectionId: String(data.id),
              connectionName: data.connectionName,
              dbType: data.dbType,
              tableName: table.tableName,
              chunkIndex: i,
              timestamp: new Date().toISOString(),
              data: JSON.stringify(chunkData)
            }
          };
        }
      }
    }

    const BATCH_SIZE = 10;
    let currentBatch = [];
    
    for await (const embeddingData of generateTableChunks()) {
      currentBatch.push(embeddingData);
      
      if (currentBatch.length >= BATCH_SIZE) {
        await index.upsert(currentBatch);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      await index.upsert(currentBatch);
    }

    await index.upsert([{
      id: `schema-${String(data.id)}`,
      values: schemaEmbedding.data[0].embedding,
      metadata: {
        type: 'schema',
        connectionId: String(data.id),
        connectionName: data.connectionName,
        dbType: data.dbType,
        timestamp: new Date().toISOString(),
        schema: JSON.stringify(schemaText)
      },
    }]);
    console.log("Pinecone upsert successful for schema and all data chunks");

    return true;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

export async function getDbData(id) {
  const data = await db.select().from(dbConnections).where(eq(dbConnections.id, id));
  return data;
}

export async function getQueryEmbeddings(message, connectionId) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const questionEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message
    });

    const queryResult = await index.query({
      vector: questionEmbedding.data[0].embedding,
      filter: { connectionId: String(connectionId) },
      topK: 5,
      includeMetadata: true
    });

    const matches = queryResult.matches || [];
    
    const schemaInfo = matches.find(m => m.metadata?.type === 'schema')?.metadata?.schema;
    const dataInfo = matches
      .filter(m => m.metadata?.type === 'data')
      .map(m => m.metadata?.data)
      .filter(Boolean);

    let parsedSchema = [];
    try {
      parsedSchema = schemaInfo ? JSON.parse(schemaInfo) : [];
      if (!Array.isArray(parsedSchema)) {
        parsedSchema = [];
      }
    } catch (e) {
      console.error('Error parsing schema:', e);
      parsedSchema = [];
    }

    let parsedData = [];
    try {
      const combinedData = dataInfo.map(info => {
        try {
          return JSON.parse(info);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      parsedData = combinedData.map(item => ({
        tableName: item.tableName || 'Unknown Table',
        sampleData: Array.isArray(item.sampleData) ? item.sampleData : []
      }));
    } catch (e) {
      console.error('Error parsing data:', e);
      parsedData = [];
    }

    return {
      schema: parsedSchema,
      sampleData: parsedData
    };
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