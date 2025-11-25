export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, AlertCircle, CheckCircle, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Security - NexaGestion",
  description: "Learn about NexaGestion's comprehensive security measures and compliance standards.",
};

const securityFeatures = [
  {
    icon: Lock,
    title: "Data Encryption",
    description: "All data is encrypted in transit and at rest using industry-standard encryption protocols"
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description: "Fine-grained permission system ensures users only access data they're authorized to see"
  },
  {
    icon: Eye,
    title: "Audit Logging",
    description: "Complete audit trail of all system activities for compliance and security monitoring"
  },
  {
    icon: Key,
    title: "API Security",
    description: "Secure API endpoints with token-based authentication and rate limiting"
  },
  {
    icon: AlertCircle,
    title: "Threat Detection",
    description: "Real-time monitoring and alerts for suspicious activities"
  },
  {
    icon: CheckCircle,
    title: "Compliance Ready",
    description: "Built to meet GDPR, SOC 2, and other regulatory requirements"
  },
];

const complianceStandards = [
  "GDPR - General Data Protection Regulation",
  "SOC 2 Type II Certification",
  "ISO 27001 Information Security",
  "HIPAA - Health Insurance Portability",
  "PCI DSS - Payment Card Industry",
  "CCPA - California Consumer Privacy Act",
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Security First
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade security to protect your business data
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-16">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-border/50 bg-card p-8 hover:border-blue-500/50 transition-all"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
                    <Icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-blue-500/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Compliance Standards</h2>
          <div className="rounded-2xl border border-border/50 bg-card p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>{standard}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Infrastructure Security</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/50 bg-card p-12"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Centers</h3>
                <p className="text-muted-foreground">
                  Hosted on secure, redundant data centers with 99.99% uptime SLA
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">DDoS Protection</h3>
                <p className="text-muted-foreground">
                  Advanced DDoS mitigation to protect against attacks
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Backup & Recovery</h3>
                <p className="text-muted-foreground">
                  Automated daily backups with disaster recovery procedures
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Penetration Testing</h3>
                <p className="text-muted-foreground">
                  Regular security audits and penetration testing by third parties
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

