"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Package,
  Zap,
  Lock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time insights into sales, inventory, and operations",
  },
  {
    icon: Users,
    title: "Multi-Company Management",
    description: "Manage multiple companies with isolated operations",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock, movements, and inventory counts",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance for seamless operations",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access control and data encryption",
  },
  {
    icon: Globe,
    title: "Maritime Focused",
    description: "Built for maritime operations and boat management",
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your business efficiently
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
                    <Icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

