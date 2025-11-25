export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { motion } from "framer-motion";
import { Award, Users, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - NexaGestion",
  description: "Learn about NexaGestion, our mission, and our commitment to excellence in ERP solutions.",
};

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our product and service"
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your success is our success. We listen and adapt to your needs"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Continuously innovating to bring cutting-edge solutions to market"
  },
  {
    icon: Globe,
    title: "Global Vision",
    description: "Built for businesses worldwide with multi-language and multi-currency support"
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">NexaGestion</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Transforming business operations through modern ERP solutions
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/50 bg-card p-12"
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              At NexaGestion, we believe that every business deserves access to world-class ERP solutions. Our mission is to empower organizations of all sizes with powerful, intuitive, and affordable tools to manage their operations efficiently.
            </p>
            <p className="text-lg text-muted-foreground">
              We specialize in maritime and commerce operations, understanding the unique challenges these industries face. Our platform is built with deep industry expertise and cutting-edge technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-blue-500/5">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4">
                      <Icon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Active Users" },
              { number: "50+", label: "Companies" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-blue-500 mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

