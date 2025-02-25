"use client"

import { useState } from "react"
import { Plus, ArrowRight, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Connections from "../_components/connections"
import { embeddings } from "../actions/chat"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Page = () => {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dbType, setDbType] = useState("postgresql")

  const validateInputs = () => {
    const mongoUrlRegex = /^mongodb(\+srv)?:\/\/[^\s]+$/;
    const postgresUrlRegex = /^postgres(ql)?:\/\/[^\s]+$/;

    if (!url) {
      setError("Please enter a database URL");
      return false;
    }

    if (!name) {
      setError("Please enter a connection name");
      return false;
    }

    if (!dbType) {
      setError("Please select a database type");
      return false;
    }

    if (dbType === 'postgresql' && !postgresUrlRegex.test(url)) {
      setError("Please enter a valid PostgreSQL URL");
      return false;
    }

    if (dbType === 'mongodb' && !mongoUrlRegex.test(url)) {
      setError("Please enter a valid MongoDB URL");
      return false;
    }

    setError("");
    return true;
  }

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const endpoint = dbType === 'postgresql' ? '/api/connectDb' : '/api/connectMongodb';
      const payload = {
        connectionName: name,
        [dbType === 'postgresql' ? 'postgresUrl' : 'mongoUrl']: url,
        dbType,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to connect to database");
      }

      const data = await response.json();

      console.log(data);
      await embeddings(data);
      setShowModal(false);
      setUrl("");
      setName("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <div className="max-w-7xl mx-auto p-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 group text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Main Page
        </Button>

        <div className="flex flex-wrap gap-8">
          <div
            className="w-72 h-72 shrink-0 border-2 border-dashed border-red-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all duration-300 group"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-12 h-12 text-red-300 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300" />
            <p className="mt-4 text-red-400 font-medium">Add New Connection</p>
          </div>

          <div className="flex-1 min-w-[300px]">
            <Connections refreshTrigger={refreshKey} />
          </div>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Add New Connection</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Database Type</label>
                <Select
                  value={dbType}
                  onValueChange={(value) => setDbType(value)}
                  className="border-red-100 focus:border-red-300 focus:ring-red-200"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {dbType === 'postgresql' ? 'PostgreSQL URL' : 'MongoDB URL'}
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-red-100 focus:border-red-300 focus:ring-red-200"
                  placeholder={`Enter ${dbType === 'postgresql' ? 'PostgreSQL' : 'MongoDB'} URL`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Collection Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-red-100 focus:border-red-300 focus:ring-red-200"
                  placeholder="Enter collection name"
                />
              </div>

              {error && <p className="text-red-500 text-sm animate-fadeIn">{error}</p>}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Page

