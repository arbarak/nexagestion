"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          setStatus("error");
          setMessage(data.message || "Email verification failed");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully!");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified successfully!"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-500/10 border border-blue-500/20 p-4">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/10 border border-green-500/20 p-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex justify-center">
                <div className="rounded-full bg-red-500/10 border border-red-500/20 p-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {status === "success" && (
              <p className="text-xs text-muted-foreground">
                Redirecting to login in 3 seconds...
              </p>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                    Try Again
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}

            {status === "success" && (
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  Go to Login
                </Button>
              </Link>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

