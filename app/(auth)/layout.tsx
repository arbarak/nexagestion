import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/landing" className="flex items-center space-x-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all" />
          <span className="text-lg font-bold hidden sm:inline">NexaGestion</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        {children}
      </div>

      {/* Footer */}
      <div className="fixed bottom-8 left-0 right-0 text-center text-sm text-muted-foreground">
        <p>
          © 2025 NexaGestion. All rights reserved. |{" "}
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          {" "} |{" "}
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}

