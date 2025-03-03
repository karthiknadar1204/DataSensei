"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DatabaseConnection() {
  return (
    <section className="w-full py-12 md:py-24 bg-[#111]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Connect Your Database</h2>
          <p className="text-gray-400 text-sm md:text-lg">Simple and secure connection to your PostgreSQL or MongoDB database</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto items-center">
          <div className="space-y-4 md:space-y-6 w-full">
            <div>
              <label className="text-white mb-2 block text-sm md:text-lg">Database Type</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 text-sm md:text-lg">
                <option>PostgreSQL</option>
                <option>MongoDB</option>
              </select>
            </div>

            <div>
              <label className="text-white mb-2 block text-sm md:text-lg">Database URL</label>
              <Input
                placeholder="database://username:password@host:port/database"
                className="bg-gray-800 border-gray-700 text-white text-sm md:text-lg"
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Format: postgresql://username:password@host:port/database or mongodb://username:password@host:port/database
              </p>
            </div>

            <div>
              <label className="text-white mb-2 block text-sm md:text-lg">SSL Mode</label>
              <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 text-sm md:text-lg">
                <option>Require</option>
                <option>Prefer</option>
                <option>Disable</option>
              </select>
            </div>

            <Button className="w-full bg-red-500 hover:bg-red-600 text-sm md:text-lg py-2 md:py-3">
              Connect Database
            </Button>

            <div className="p-3 md:p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white mb-2 text-sm md:text-lg">Connection Status</h4>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                <span className="text-gray-400 text-sm md:text-lg">Not Connected</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 w-full">
            {[
              {
                title: "Secure Connection",
                description: "Your database connection is encrypted and secure. We never store your credentials.",
              },
              {
                title: "Auto Schema Detection",
                description: "We automatically detect your database schema and prepare it for chat interface.",
              },
              {
                title: "Real-time Sync",
                description: "Changes in your database are reflected in real-time in visualizations and analytics.",
              },
            ].map((feature) => (
              <div key={feature.title} className="p-4 md:p-6 bg-gray-800 rounded-lg">
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm md:text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
