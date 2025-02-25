'use client'

import { useState } from 'react'

export const ClarificationMessage = ({ response, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const content = response.data?.content || response.content
  const connectionId = response.data?.connectionId || response.connectionId

  if (!connectionId) {
    console.error('No connection ID provided to ClarificationMessage')
    return (
      <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
        <div className="text-red-500">
          <p className="font-medium">Error: Missing connection ID</p>
          <p className="text-sm mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  if (!content?.question || !content?.options || !Array.isArray(content.options) || content.options.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
        <div className="text-red-500">
          <p className="font-medium">Sorry, I couldn't process that request.</p>
          <p className="text-sm mt-1">Please try asking your question again.</p>
        </div>
      </div>
    )
  }

  const handleSelection = (option) => {
    if (!hasSubmitted) {
      setSelectedOption(option.type)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedOption && !hasSubmitted) {
      const formData = new FormData()
      formData.append('input', `Use a ${selectedOption} chart to visualize the data`)
      formData.append('connectionId', String(connectionId))
      onSubmit(formData)
      setHasSubmitted(true)
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
      <div className="space-y-4">
        <div>
          <p className="font-medium">{content.question}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {content.options.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSelection(option)}
              disabled={hasSubmitted}
              className={`p-4 rounded-lg text-left transition-colors ${
                selectedOption === option.type
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              } ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-medium">{option.type}</div>
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || hasSubmitted}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Visualization
          </button>
        </div>
      </div>
    </div>
  )
} 