export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - NexaGestion",
  description: "Read the latest articles and insights about ERP, maritime operations, and business management.",
};

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with NexaGestion: A Complete Guide",
    excerpt: "Learn how to set up your NexaGestion account and start managing your business operations efficiently.",
    author: "Ahmed Hassan",
    date: "Nov 15, 2025",
    category: "Getting Started",
    slug: "getting-started-guide"
  },
  {
    id: 2,
    title: "Best Practices for Inventory Management",
    excerpt: "Discover proven strategies to optimize your inventory management and reduce costs.",
    author: "Fatima Al-Mansouri",
    date: "Nov 10, 2025",
    category: "Best Practices",
    slug: "inventory-best-practices"
  },
  {
    id: 3,
    title: "Maritime Operations: Streamlining with ERP",
    excerpt: "How modern ERP systems are transforming maritime operations and improving efficiency.",
    author: "Mohammed Karim",
    date: "Nov 5, 2025",
    category: "Maritime",
    slug: "maritime-erp-guide"
  },
  {
    id: 4,
    title: "Security Best Practices for Your Business Data",
    excerpt: "Essential security measures to protect your sensitive business information.",
    author: "Ahmed Hassan",
    date: "Oct 28, 2025",
    category: "Security",
    slug: "security-best-practices"
  },
  {
    id: 5,
    title: "Scaling Your Business with Multi-Company Management",
    excerpt: "Learn how to manage multiple companies efficiently with NexaGestion.",
    author: "Fatima Al-Mansouri",
    date: "Oct 20, 2025",
    category: "Growth",
    slug: "multi-company-scaling"
  },
  {
    id: 6,
    title: "Analytics and Reporting: Making Data-Driven Decisions",
    excerpt: "Leverage advanced analytics to make better business decisions.",
    author: "Mohammed Karim",
    date: "Oct 15, 2025",
    category: "Analytics",
    slug: "analytics-reporting"
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Blog & Insights
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Stay updated with the latest articles and insights about ERP and business management
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group rounded-xl border border-border/50 bg-card overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="space-y-3 border-t border-border/50 pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {post.author}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {post.date}
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

