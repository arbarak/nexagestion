import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ScrollToTop } from "@/components/marketing/scroll-to-top";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

