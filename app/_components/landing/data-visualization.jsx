import { BarChart3, PieChart, LineChart, ScatterChartIcon as ScatterPlot } from "lucide-react"
import { Button } from "@/components/ui/button"

const chartTypes = [
  { icon: BarChart3, name: "Bar Charts" },
  { icon: PieChart, name: "Pie Charts" },
  { icon: LineChart, name: "Line Graphs" },
  { icon: ScatterPlot, name: "Scatter Plots" },
]

const features = [
  "Interactive tooltips and legends",
  "Dynamic data updates",
  "Customizable colors and styles",
  "Export to PNG/SVG",
]

export default function DataVisualization() {
  return (
    <section className="w-full py-12 md:py-24 bg-[#111]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Dynamic Data Visualization</h2>
          <p className="text-gray-400">Transform your data into interactive visualizations instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg md:text-xl mb-4">Available Chart Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chartTypes.map((chart) => (
                  <div key={chart.name} className="p-4 bg-gray-800 rounded-lg flex items-center space-x-3">
                    <chart.icon className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                    <span className="text-white text-sm md:text-base">{chart.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg md:text-xl mb-4">Visualization Features</h3>
              <div className="space-y-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2 text-gray-300">
                    <svg
                      className="h-5 w-5 text-red-500 shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 md:p-8 rounded-lg flex flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 md:h-16 md:w-16 text-red-500 mb-4" />
            <p className="text-gray-300 mb-4 text-center text-sm md:text-base">
              Interactive D3.js Visualization Demo
            </p>
            <Button className="bg-red-500 hover:bg-red-600">Try Demo</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

