'use client'

import React, { useEffect, useState } from 'react'
import { getChatHistory } from '../actions/chat'
import { submitChat } from '../actions/chatAction'
import Message from './messages/Message'
import { Loader2 } from 'lucide-react'

const ChatPanel = React.forwardRef(({ connectionId }, ref) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const messageCounter = React.useRef(0);

  const getUniqueId = () => {
    messageCounter.current += 1;
    return `${Date.now()}-${messageCounter.current}`;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const previousChats = await getChatHistory(connectionId)
        setMessages(previousChats)
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [connectionId])

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)

    const submitData = formData instanceof FormData ? formData : (() => {
      const fd = new FormData()
      fd.append('input', formData)
      fd.append('connectionId', connectionId)
      return fd
    })()

    try {
      const userMessage = submitData.get('input')
      
      const tempUserMessage = {
        id: getUniqueId(),
        message: userMessage,
        type: 'user',
        temporary: true
      }

      const tempLoadingMessage = {
        id: getUniqueId(),
        type: 'loading',
        temporary: true
      }

      setMessages(prev => [...prev, tempUserMessage, tempLoadingMessage])

      const response = await submitChat(submitData)

      if (response.error) {
        throw new Error(response.error)
      }

      setMessages(prev => {
        return [...prev.filter(msg => !msg.temporary), {
          id: response.id,
          message: userMessage,
          response: response.response,
          connectionId: response.connectionId
        }]
      })
    } catch (error) {
      console.error('Error submitting chat:', error)
      setMessages(prev => prev.filter(msg => !msg.temporary))
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useImperativeHandle(ref, () => ({
    handleSubmit
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white/50 rounded-lg border border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          onSubmit={handleSubmit}
          isLoading={message.temporary} 
        />
      ))}
    </div>
  )
})

ChatPanel.displayName = 'ChatPanel'

export default ChatPanel