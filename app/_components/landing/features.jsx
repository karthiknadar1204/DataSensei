import { LayoutDashboard, MessageSquare, BarChart3, Calculator, Lock, RefreshCw } from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Multi-Database Support",
    description:
      "Seamlessly connect to PostgreSQL and MongoDB databases with a simple URL. Automatic schema detection and data fetching.",
  },
  {
    icon: MessageSquare,
    title: "Natural Language Chat",
    description: "Chat with your data using natural language. Ask questions about your data and get instant insights.",
  },
  {
    icon: BarChart3,
    title: "Dynamic Visualization",
    description:
      "Instantly generate interactive D3.js visualizations from your data queries. Multiple chart types supported.",
  },
  {
    icon: Calculator,
    title: "Advanced Analytics",
    description:
      "Perform complex calculations and analytics on your data. Aggregate, filter, and transform your data with ease.",
  },
  {
    icon: Lock,
    title: "Secure Access",
    description:
      "Your database credentials are encrypted and never stored. All connections are secure and protected.",
  },
  {
    icon: RefreshCw,
    title: "Real-time Updates",
    description:
      "Get real-time updates as your data changes. Visualizations and analytics are always up-to-date.",
  },
]

export default function Features() {
  return (
    <section className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Data Analysis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your database into actionable insights with our advanced features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

