import { Sidebar } from "@/components/sidebar";

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    { label: "Integrations Hub", href: "/integrations" },
    { label: "API Keys", href: "/integrations/api-keys" },
    { label: "Webhooks", href: "/integrations/webhooks" },
  ];

  return (
    <div className="flex">
      <Sidebar items={navigationItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

