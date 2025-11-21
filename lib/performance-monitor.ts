export interface PerformanceMetrics {
  page: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export function capturePerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === "undefined") return null;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  const paintEntries = performance.getEntriesByType("paint");
  const largestContentfulPaint = performance.getEntriesByType("largest-contentful-paint");

  if (!navigation) return null;

  const fcp = paintEntries.find((entry) => entry.name === "first-contentful-paint");
  const lcp = largestContentfulPaint[largestContentfulPaint.length - 1];

  const metrics: PerformanceMetrics = {
    page: window.location.pathname,
    loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    firstContentfulPaint: fcp ? Math.round(fcp.startTime) : 0,
    largestContentfulPaint: lcp ? Math.round(lcp.startTime) : 0,
    cumulativeLayoutShift: getCumulativeLayoutShift(),
    timeToInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
  };

  return metrics;
}

function getCumulativeLayoutShift(): number {
  if (typeof window === "undefined") return 0;

  let cls = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if ((entry as any).hadRecentInput) continue;
      cls += (entry as any).value;
    }
  });

  try {
    observer.observe({ type: "layout-shift", buffered: true });
    return Math.round(cls * 100) / 100;
  } catch {
    return 0;
  }
}

export async function reportPerformanceMetrics(metrics: PerformanceMetrics) {
  try {
    await fetch("/api/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...metrics,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("Failed to report performance metrics:", error);
  }
}

export function initializePerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Report metrics after page load
  window.addEventListener("load", () => {
    setTimeout(() => {
      const metrics = capturePerformanceMetrics();
      if (metrics) {
        reportPerformanceMetrics(metrics);
      }
    }, 0);
  });
}

