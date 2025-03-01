'use server';

import { researcher, taskManager, querySuggestor, inquire } from '@/lib/agents';
import { db } from '@/configs/db';
import { chats } from '@/configs/schema';
import { getQueryEmbeddings } from './chat';
import { and, eq, desc } from 'drizzle-orm';
import { currentUser } from "@clerk/nextjs/server";
import { evaluateResponse } from '@/lib/utils/evaluation';
import { runInBackground } from '@/lib/utils/backgroundTask';

function formatDatabaseContext(embeddingsData) {
  return `Current database context:
Schema Information:
${embeddingsData.schema.map(table => 
  `Table: ${table.tableName}
   Columns: ${table.columns}`
).join('\n')}

Sample Data:
${embeddingsData.sampleData.map(table => 
  `Table: ${table.tableName}
   Data: ${JSON.stringify(table.sampleData, null, 2)}`
).join('\n\n')}`;
}

async function saveChat(message, response, connectionId) {
  const user = await currentUser();
  if (!user) return null;

  // Check if a chat record exists for this user and connection
  const existingChat = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.userId, user.id),
        eq(chats.connectionId, connectionId)
      )
    )
    .limit(1);

  const newConversationEntry = {
    message,
    response: JSON.stringify(response),
    timestamp: new Date().toISOString()
  };

  if (existingChat.length > 0) {
    // Update existing chat record
    const currentConversation = existingChat[0].conversation || [];
    const updatedConversation = Array.isArray(currentConversation) 
      ? [...currentConversation, newConversationEntry]
      : [newConversationEntry];

    await db
      .update(chats)
      .set({
        conversation: updatedConversation,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(chats.userId, user.id),
          eq(chats.connectionId, connectionId)
        )
      );
  } else {
    // Create new chat record
    await db.insert(chats).values({
      userId: user.id,
      connectionId: connectionId,
      conversation: [newConversationEntry]
    });
  }
}

async function getPreviousChats(connectionId, limit = 10) {
  const user = await currentUser();
  if (!user) return [];

  const chatRecord = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.connectionId, connectionId),
        eq(chats.userId, user.id)
      )
    )
    .limit(1);

  if (!chatRecord.length) return [];

  // Get the last 'limit' conversations from the array
  const conversations = chatRecord[0].conversation || [];
  const limitedConversations = conversations.slice(-limit);

  return limitedConversations.map(chat => ({
    role: 'user',
    content: chat.message,
    response: JSON.parse(chat.response),
    timestamp: new Date(chat.createdAt * 1000)
  }));
}

export async function submitChat(formData) {
  const userInput = formData?.get('input');
  const connectionId = formData?.get('connectionId');
  
  if (!userInput || !connectionId) {
    return { error: 'No input or connection ID provided' };
  }

  try {

    const [previousChats, embeddingsData, taskAction] = await Promise.all([
      getPreviousChats(connectionId),
      getQueryEmbeddings(userInput, connectionId),
      taskManager([
        { 
          role: 'system', 
          content: 'Initial context. Direct questions about counts, totals, or current state should be analyzed directly.' 
        },
        { role: 'user', content: userInput }
      ])
    ]);

    const chatHistory = previousChats.map(chat => [
      { role: 'user', content: chat.content },
      { role: 'assistant', content: JSON.stringify(chat.response) }
    ]).flat();

    const databaseContext = formatDatabaseContext(embeddingsData);
    
    let response;

    const isDirectQuery = userInput.toLowerCase().match(/^(how many|what|who|tell me|show|list|count|get|find)/i);
    
    
    if (taskAction.next === 'inquire' && isDirectQuery) {

      const researchResult = await researcher([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);

      response = { 
        type: 'analysis',
        data: researchResult 
      };
    } else if (taskAction.next === 'inquire') {
      response = await inquire([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);
    } else {
      const isVisualization = taskAction.next === 'visualize';
      const researchResult = await researcher([
        { role: 'system', content: databaseContext },
        ...chatHistory,
        { role: 'user', content: userInput }
      ]);

      response = { 
        type: isVisualization ? 'visualization' : 'analysis',
        data: researchResult 
      };
    }


    runInBackground(async () => {
      await Promise.all([
        evaluateResponse({
          userInput,
          aiResponse: response,
          expectedFormat: taskAction.next === 'visualize' ? 'Visualization JSON format' : 'Analysis JSON format',
          context: databaseContext
        }),
        saveChat(userInput, response, connectionId)
      ]);
    });

    return {
      id: Date.now(),
      message: userInput,
      response,
      connectionId
    };
  } catch (error) {
    console.error('Error in submitChat:', error);
    throw error;
  }
}
