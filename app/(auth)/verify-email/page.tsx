"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

function VerifyEmailFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
