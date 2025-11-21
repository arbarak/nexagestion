"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const { data: session } = useSession();

  const integrations = [
    {
      title: "API Keys",
      description: "Manage API keys for third-party integrations",
      href: "/integrations/api-keys",
      icon: "🔑",
      status: "active",
    },
    {
      title: "Webhooks",
      description: "Configure webhooks for real-time events",
      href: "/integrations/webhooks",
      icon: "🪝",
      status: "active",
    },
    {
      title: "Email Integration",
      description: "Configure email notifications and templates",
      href: "/integrations/email",
      icon: "📧",
      status: "coming-soon",
    },
    {
      title: "Payment Gateway",
      description: "Connect payment processing services",
      href: "/integrations/payments",
      icon: "💳",
      status: "coming-soon",
    },
    {
      title: "SMS Notifications",
      description: "Send SMS alerts and notifications",
      href: "/integrations/sms",
      icon: "📱",
      status: "coming-soon",
    },
    {
      title: "Cloud Storage",
      description: "Connect cloud storage for backups",
      href: "/integrations/storage",
      icon: "☁️",
      status: "coming-soon",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Connect external services and manage API integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Link
            key={integration.href}
            href={integration.status === "active" ? integration.href : "#"}
          >
            <Card
              className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${
                integration.status === "coming-soon" ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{integration.icon}</span>
                      {integration.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      {integration.description}
                    </p>
                  </div>
                  {integration.status === "coming-soon" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={integration.status === "coming-soon"}
                >
                  {integration.status === "active" ? "Configure →" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

