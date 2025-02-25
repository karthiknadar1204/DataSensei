'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Copy, Database, ChevronLeft } from 'lucide-react'

const SchemaViewer = ({ data }) => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyUrl = async () => {
    const url = data?.[0]?.postgresUrl || data?.[0]?.mongoUrl;
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  }

  const handleTableClick = (table) => {
    setSelectedTable(table)
  }

  const renderContent = () => {
    if (selectedTable) {
      return (
        <div className="mt-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{selectedTable.tableName}</h3>
            <button 
              onClick={() => setSelectedTable(null)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Tables
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Column Name</TableHead>
                <TableHead className="font-semibold">Data Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTable.columns.map((column, index) => (
                <TableRow key={index} className="hover:bg-red-50">
                  <TableCell className="font-medium">{column.column_name}</TableCell>
                  <TableCell className="text-gray-600">{column.data_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data?.[0]?.tableSchema?.map((table) => (
          <button
            key={table.tableName}
            onClick={() => handleTableClick(table)}
            className="p-4 text-left border border-gray-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all duration-200 group"
          >
            <p className="font-medium text-gray-900 group-hover:text-red-600">{table.tableName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {table.columns.length} columns
            </p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopyUrl}
        className={`p-2 rounded-md transition-all duration-200 ${
          copySuccess 
            ? 'bg-green-50 text-green-600' 
            : 'hover:bg-red-50 text-gray-600 hover:text-red-500'
        }`}
        title="Copy Database URL"
      >
        <Copy className="w-5 h-5" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2">
            <Database className="w-4 h-4" />
            Schema
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedTable ? `Table: ${selectedTable.tableName}` : 'Database Schema'}
            </DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SchemaViewer 