import Link from "next/link"
import { Twitter, Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-[#111] text-gray-400">
      <div className="container max-w-7xl mx-auto px-8 md:px-12 py-12 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <h3 className="text-white text-2xl font-bold">DataChat</h3>
            <p className="text-sm">
              Transform your PostgreSQL data into interactive visualizations through natural language conversations.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {["Features", "Visualizations", "Examples", "Pricing"].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {["Documentation", "API Reference", "Blog", "Support"].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2024 DataChat. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:text-white">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

