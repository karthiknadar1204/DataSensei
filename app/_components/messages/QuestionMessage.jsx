'use client'

import { useState } from 'react'

export const QuestionMessage = ({ response, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [customInput, setCustomInput] = useState('')

  const handleSelection = (option) => {
    setSelectedOption(option)
    setCustomInput(option)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const inputToSubmit = customInput.trim() || selectedOption
    if (inputToSubmit) {
      onSubmit(inputToSubmit)
      if (customInput !== selectedOption) {
        setCustomInput('')
      }
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
      <div className="space-y-4">
        <div>
          <p className="font-medium">{response.question}</p>
          <p className="text-sm text-gray-600 mt-1">{response.context}</p>
        </div>

        <div className="space-y-2">
          {response.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelection(option)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedOption === option
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              type={response.inputType}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value)
                setSelectedOption('')
              }}
              placeholder={response.allowCustomInput ? "Or enter your own..." : selectedOption}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              disabled={!response.allowCustomInput && !selectedOption}
            />
            <button
              type="submit"
              disabled={!customInput.trim() && !selectedOption}
              className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 