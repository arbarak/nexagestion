export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

export interface PerformanceStats {
  endpoint: string;
  method: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  requestCount: number;
  errorCount: number;
}

export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000;

  recordMetric(
    name: string,
    duration: number,
    endpoint?: string,
    method?: string,
    statusCode?: number
  ): void {
    this.metrics.push({
      name,
      duration,
      timestamp: new Date(),
      endpoint,
      method,
      statusCode,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(endpoint?: string, method?: string): PerformanceMetric[] {
    return this.metrics.filter((m) => {
      if (endpoint && m.endpoint !== endpoint) return false;
      if (method && m.method !== method) return false;
      return true;
    });
  }

  getStats(endpoint: string, method: string): PerformanceStats {
    const metrics = this.getMetrics(endpoint, method);
    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const errors = metrics.filter((m) => m.statusCode && m.statusCode >= 400).length;

    return {
      endpoint,
      method,
      avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: durations.length > 0 ? durations[0] : 0,
      maxDuration: durations.length > 0 ? durations[durations.length - 1] : 0,
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
      requestCount: metrics.length,
      errorCount: errors,
    };
  }

  getAllStats(): PerformanceStats[] {
    const grouped = new Map<string, PerformanceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.endpoint}:${metric.method}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(metric);
    }

    const stats: PerformanceStats[] = [];
    for (const [key, metrics] of grouped.entries()) {
      const [endpoint, method] = key.split(':');
      const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
      const errors = metrics.filter((m) => m.statusCode && m.statusCode >= 400).length;

      stats.push({
        endpoint,
        method,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: durations[0],
        maxDuration: durations[durations.length - 1],
        p95Duration: this.percentile(durations, 95),
        p99Duration: this.percentile(durations, 99),
        requestCount: metrics.length,
        errorCount: errors,
      });
    }

    return stats;
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getSlowRequests(threshold: number = 1000, limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

export const performanceService = new PerformanceService();

