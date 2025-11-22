import { Metadata } from "next";
import { motion } from "framer-motion";
import { BarChart3, Users, Package, Zap, Lock, Globe, Smartphone, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Features - NexaGestion ERP",
  description: "Explore all powerful features of NexaGestion ERP system for maritime and commerce operations.",
  keywords: ["ERP features", "inventory management", "sales management", "maritime operations"],
};

const allFeatures = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time insights into sales, inventory, and operations with customizable dashboards",
    details: ["Real-time KPIs", "Custom reports", "Data visualization", "Export capabilities"]
  },
  {
    icon: Users,
    title: "Multi-Company Management",
    description: "Manage multiple companies with isolated operations and centralized control",
    details: ["Company isolation", "Centralized reporting", "User management", "Access control"]
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock, movements, and inventory counts with precision",
    details: ["Stock tracking", "Movement history", "Inventory counts", "Alerts & notifications"]
  },
  {
    icon: Zap,
    title: "Lightning Fast Performance",
    description: "Optimized performance for seamless operations at any scale",
    details: ["Fast load times", "Optimized queries", "Caching", "Scalable architecture"]
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access control and data encryption for maximum protection",
    details: ["RBAC system", "Data encryption", "Audit logs", "Compliance ready"]
  },
  {
    icon: Globe,
    title: "Maritime Focused",
    description: "Built specifically for maritime operations and boat management",
    details: ["Vessel tracking", "Cargo management", "Voyage planning", "Intervention logs"]
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Full-featured mobile application for on-the-go management",
    details: ["iOS & Android", "Offline mode", "Real-time sync", "Push notifications"]
  },
  {
    icon: Cpu,
    title: "API & Integrations",
    description: "Powerful API for custom integrations with your existing systems",
    details: ["REST API", "Webhooks", "Third-party integrations", "Custom workflows"]
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to manage your business efficiently and effectively
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group rounded-xl border border-border/50 bg-card p-6 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
                    <Icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center">
                        <span className="mr-2 h-1 w-1 rounded-full bg-blue-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

