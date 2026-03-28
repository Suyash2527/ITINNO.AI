import { motion } from "framer-motion";
import { Brain, Wallet, Map } from "lucide-react";

const features = [
  {
    title: "Smart Planning",
    description: "AI-driven itinerary generation that understands your preferences and creates the perfect route.",
    icon: Brain,
  },
  {
    title: "Budget Optimization",
    description: "Get the most out of your trip with intelligent suggestions that fit your exact budget.",
    icon: Wallet,
  },
  {
    title: "Route Intelligence",
    description: "Avoid distant jumps and maximize your time with geographically optimized travel paths.",
    icon: Map,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text mb-4">Why Choose Itinno?</h2>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            Our AI-powered platform takes the stress out of travel planning, leaving you with more time to enjoy your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-text/10"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-text mb-3">{feature.title}</h3>
              <p className="text-text/70 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
