import { Metadata } from "next";
import { HeroSection } from "@/components/marketing/sections/hero";
import { FeaturesSection } from "@/components/marketing/sections/features";
import { SolutionsSection } from "@/components/marketing/sections/solutions";
import { PricingSection } from "@/components/marketing/sections/pricing";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials";
import { FAQSection } from "@/components/marketing/sections/faq";
import { CTASection } from "@/components/marketing/sections/cta";

export const metadata: Metadata = {
  title: "NexaGestion - Modern ERP for Maritime & Commerce",
  description:
    "Fast, scalable multi-company ERP system for maritime operations and commerce. Manage sales, inventory, employees, and more.",
  keywords: [
    "ERP",
    "maritime",
    "commerce",
    "inventory management",
    "sales management",
  ],
  openGraph: {
    title: "NexaGestion - Modern ERP for Maritime & Commerce",
    description:
      "Fast, scalable multi-company ERP system for maritime operations and commerce.",
    url: "https://nexagestion.arbark.cloud",
    siteName: "NexaGestion",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SolutionsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}

