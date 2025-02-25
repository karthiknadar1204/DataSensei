import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "49",
    features: ["Up to 5 Database Connections", "100 Queries/day", "Basic Visualizations", "Email Support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "99",
    features: ["Unlimited Database Connections", "1000 Queries/day", "Advanced Visualizations", "Priority Support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Custom Database Integration", "Unlimited Queries", "Custom Visualizations", "24/7 Dedicated Support"],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
          <p className="text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg p-6 md:p-8 ${
                plan.popular ? "bg-[#111] text-white" : "bg-white border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
                  Popular
                </div>
              )}
              <h3 className="text-lg md:text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl md:text-4xl font-bold">
                  {plan.price === "Custom" ? (
                    "Custom"
                  ) : (
                    <>
                      ${plan.price}
                      <span className="text-sm md:text-base font-normal">/month</span>
                    </>
                  )}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3 text-sm md:text-base">
                    <Check className={`h-5 w-5 ${plan.popular ? "text-red-500" : "text-green-500"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.popular ? "bg-red-500 hover:bg-red-600" : "bg-[#111] hover:bg-gray-900"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

