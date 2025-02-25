"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Contact() {
  return (
    <section className="w-full py-24 bg-[#111]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Get In Touch</h2>
          <p className="text-gray-400">Have questions? We're here to help</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg flex items-start space-x-4">
              <Mail className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-white font-semibold mb-1">Email Us</h3>
                <p className="text-gray-400">support@datachat.com</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg flex items-start space-x-4">
              <Phone className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-white font-semibold mb-1">Call Us</h3>
                <p className="text-gray-400">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                <p className="text-gray-400">
                  123 Innovation Drive
                  <br />
                  Silicon Valley, CA 94025
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <form className="space-y-4">
              <div>
                <label className="text-white mb-2 block">Name</label>
                <Input className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-white mb-2 block">Email</label>
                <Input className="bg-gray-700 border-gray-600 text-white" type="email" />
              </div>
              <div>
                <label className="text-white mb-2 block">Subject</label>
                <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Sales</option>
                </select>
              </div>
              <div>
                <label className="text-white mb-2 block">Message</label>
                <Textarea className="bg-gray-700 border-gray-600 text-white min-h-[150px]" />
              </div>
              <Button className="w-full bg-red-500 hover:bg-red-600">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
