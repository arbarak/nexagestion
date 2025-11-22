import { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Blog Post - NexaGestion`,
    description: "Read our latest blog post about ERP and business management.",
  };
}

const blogContent: Record<string, any> = {
  "getting-started-guide": {
    title: "Getting Started with NexaGestion: A Complete Guide",
    author: "Ahmed Hassan",
    date: "Nov 15, 2025",
    category: "Getting Started",
    content: `
      <h2>Introduction</h2>
      <p>Welcome to NexaGestion! This comprehensive guide will help you get started with our powerful ERP system.</p>
      
      <h2>Step 1: Account Setup</h2>
      <p>First, create your account and set up your company profile. This is where you'll configure basic information about your organization.</p>
      
      <h2>Step 2: User Management</h2>
      <p>Add team members and assign roles based on their responsibilities. NexaGestion supports multiple roles with different permission levels.</p>
      
      <h2>Step 3: Configure Modules</h2>
      <p>Enable the modules you need for your business operations. You can start with basic modules and add more as you grow.</p>
      
      <h2>Step 4: Import Data</h2>
      <p>Import your existing data from your previous system. We provide templates and support for smooth data migration.</p>
      
      <h2>Conclusion</h2>
      <p>You're now ready to start using NexaGestion! For more help, check our documentation or contact support.</p>
    `
  },
  "inventory-best-practices": {
    title: "Best Practices for Inventory Management",
    author: "Fatima Al-Mansouri",
    date: "Nov 10, 2025",
    category: "Best Practices",
    content: `
      <h2>Why Inventory Management Matters</h2>
      <p>Effective inventory management is crucial for business success. It helps reduce costs and improve customer satisfaction.</p>
      
      <h2>Best Practice 1: Regular Audits</h2>
      <p>Conduct regular inventory audits to ensure accuracy and identify discrepancies early.</p>
      
      <h2>Best Practice 2: ABC Analysis</h2>
      <p>Classify your inventory using ABC analysis to focus on high-value items.</p>
      
      <h2>Best Practice 3: Automated Alerts</h2>
      <p>Set up automated alerts for low stock levels to prevent stockouts.</p>
      
      <h2>Best Practice 4: Data Accuracy</h2>
      <p>Maintain accurate inventory records to make better business decisions.</p>
      
      <h2>Conclusion</h2>
      <p>By following these best practices, you can optimize your inventory management and improve profitability.</p>
    `
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogContent[slug] || {
    title: "Blog Post Not Found",
    author: "Unknown",
    date: "Unknown",
    category: "General",
    content: "<p>This blog post could not be found.</p>"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border/50">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
              {post.category}
            </span>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {post.date}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-invert">
          <div
            className="space-y-6 text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-foreground mt-8 mb-4">')
                .replace(/<p>/g, '<p class="leading-relaxed">')
            }}
          />
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-gradient-to-b from-background to-blue-500/5">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold mb-8">More Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Link
                key={i}
                href="/blog"
                className="rounded-lg border border-border/50 bg-card p-6 hover:border-blue-500/50 transition-all"
              >
                <h3 className="font-semibold mb-2">Related Article {i}</h3>
                <p className="text-sm text-muted-foreground">Read more insights from our blog</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

