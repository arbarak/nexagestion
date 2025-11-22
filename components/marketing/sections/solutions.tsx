"use client";

import { motion } from "framer-motion";
import { Ship, Store, Briefcase } from "lucide-react";

const solutions = [
  {
    icon: Ship,
    title: "Maritime Operations",
    description:
      "Specialized tools for boat management, interventions, and maritime logistics",
    features: ["Boat tracking", "Intervention management", "Satellite subscriptions"],
  },
  {
    icon: Store,
    title: "Commerce & Retail",
    description:
      "Complete sales management from quotes to invoices with inventory tracking",
    features: ["Sales pipeline", "Inventory management", "Customer management"],
  },
  {
    icon: Briefcase,
    title: "Enterprise Management",
    description:
      "Multi-company operations with centralized control and reporting",
    features: ["Multi-company support", "Advanced reporting", "User management"],
  },
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-blue-500/5">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Solutions for Every Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tailored solutions for maritime, commerce, and enterprise operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-border/50 bg-card p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="mb-6 inline-flex rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4">
                  <Icon className="h-8 w-8 text-blue-500" />
                </div>
                
                <h3 className="text-2xl font-semibold mb-3">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {solution.description}
                </p>
                
                <ul className="space-y-2">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="mr-3 h-2 w-2 rounded-full bg-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

