export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  robots?: string;
}

export function generateMetadata(seo: SEOMetadata) {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(", "),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: seo.ogType || "website",
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
    },
    alternates: {
      canonical: seo.canonical,
    },
    robots: seo.robots || "index, follow",
  };
}

export const pageSEO = {
  dashboard: {
    title: "Dashboard - NexaGestion ERP",
    description: "Enterprise Resource Planning system dashboard",
    keywords: ["ERP", "dashboard", "business management"],
  },
  sales: {
    title: "Sales Management - NexaGestion ERP",
    description: "Manage sales orders and invoices",
    keywords: ["sales", "orders", "invoices", "ERP"],
  },
  inventory: {
    title: "Inventory Management - NexaGestion ERP",
    description: "Track stock levels and movements",
    keywords: ["inventory", "stock", "warehouse", "ERP"],
  },
  employees: {
    title: "Employee Management - NexaGestion ERP",
    description: "Manage employee records and payroll",
    keywords: ["employees", "HR", "payroll", "ERP"],
  },
  financial: {
    title: "Financial Management - NexaGestion ERP",
    description: "Accounting and financial reporting",
    keywords: ["accounting", "financial", "reports", "ERP"],
  },
};

export function getStructuredData(type: string, data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexagestion.com";

  switch (type) {
    case "organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NexaGestion",
        url: baseUrl,
        description: "Enterprise Resource Planning System",
      };

    case "software":
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "NexaGestion ERP",
        description: "Comprehensive Enterprise Resource Planning Solution",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      };

    default:
      return null;
  }
}

