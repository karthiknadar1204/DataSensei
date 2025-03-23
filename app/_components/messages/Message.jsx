'use client'

import { AnalysisMessage } from './AnalysisMessage'
import { LoadingMessage } from './LoadingMessage'
import { QuestionMessage } from './QuestionMessage'
import { VisualizationMessage } from './VisualizationMessage'
import { UserButton } from '@clerk/nextjs'
import { Bot } from 'lucide-react'
import { ClarificationMessage } from './ClarificationMessage'
import SqlQueryDisplay from '../SqlQueryDisplay'

const Message = ({ message, onSubmit, isLoading }) => {
  if (message.type === 'loading') {
    return <LoadingMessage />
  }

  if (message.type === 'user' || message.temporary) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto animate-fadeIn">
        <div className="flex justify-end items-start gap-3">
          <div className="bg-red-500 text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-sm">
            <p className="text-sm leading-relaxed">{message.message}</p>
          </div>
          <UserButton />
        </div>
      </div>
    )
  }

  let parsedResponse
  try {
    parsedResponse = typeof message.response === 'string' 
      ? JSON.parse(message.response) 
      : message.response
  } catch (e) {
    console.error('Error parsing message:', e)
    return null
  }

  const messageType = parsedResponse.data?.type === 'clarification'
    ? 'clarification'
    : parsedResponse.question 
      ? 'question' 
      : parsedResponse.data?.type === 'visualization'
        ? 'visualization'
        : parsedResponse.type

  if (messageType === 'clarification') {
    parsedResponse.connectionId = message.connectionId
  }
  console.log("parsedResponse", parsedResponse)
  console.log("messageType", messageType)
  console.log("message", message)
  console.log("response.data?.visualization?.data", parsedResponse.data?.visualization?.data)

  // Check for SQL query in the response
  const sqlQuery = parsedResponse.sqlQuery || parsedResponse.data?.sqlQuery

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto animate-fadeIn">
      <div className="flex justify-end items-start gap-3">
        <div className="bg-red-500 text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-sm">
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
        <UserButton />
      </div>

      <div className="flex justify-start items-start gap-3">
        <div className="bg-black text-white p-2 rounded-full shadow-sm">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          {messageType === 'question' ? (
            <QuestionMessage response={parsedResponse} onSubmit={onSubmit} />
          ) : messageType === 'clarification' ? (
            <ClarificationMessage response={parsedResponse} onSubmit={onSubmit} />
          ) : messageType === 'visualization' ? (
            <VisualizationMessage response={parsedResponse} />
          ) : messageType === 'analysis' ? (
            <>
              <AnalysisMessage response={parsedResponse} />
              {sqlQuery && <SqlQueryDisplay sqlQuery={sqlQuery} />}
            </>
          ) : (
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(parsedResponse, null, 2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message 