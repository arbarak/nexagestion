export interface AnalyticsMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down';
  format?: 'currency' | 'number' | 'percentage';
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export function formatMetricValue(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateTrend(current: number, previous: number): 'up' | 'down' {
  return current >= previous ? 'up' : 'down';
}

export function aggregateData(
  data: any[],
  groupBy: string,
  sumFields: string[]
): ChartDataPoint[] {
  const grouped: { [key: string]: any } = {};

  data.forEach((item) => {
    const key = item[groupBy];
    if (!grouped[key]) {
      grouped[key] = { name: key };
    }

    sumFields.forEach((field) => {
      grouped[key][field] = (grouped[key][field] || 0) + (item[field] || 0);
    });
  });

  return Object.values(grouped);
}

export function filterDataByDateRange(
  data: any[],
  dateField: string,
  startDate: Date,
  endDate: Date
): any[] {
  return data.filter((item) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

export function calculatePercentageChange(data: ChartDataPoint[], field: string): ChartDataPoint[] {
  if (data.length < 2) return data;

  const firstValue = data[0][field] as number;
  return data.map((item, idx) => ({
    ...item,
    [`${field}_change`]: idx === 0 ? 0 : (((item[field] as number) - firstValue) / firstValue) * 100,
  }));
}

export function getTopItems(data: any[], field: string, limit: number = 5): any[] {
  return [...data].sort((a, b) => (b[field] as number) - (a[field] as number)).slice(0, limit);
}

export function getBottomItems(data: any[], field: string, limit: number = 5): any[] {
  return [...data].sort((a, b) => (a[field] as number) - (b[field] as number)).slice(0, limit);
}

export function calculateAverage(data: any[], field: string): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (item[field] as number), 0);
  return sum / data.length;
}

export function calculateMedian(data: any[], field: string): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => (a[field] as number) - (b[field] as number));
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? (sorted[mid][field] as number) : ((sorted[mid - 1][field] as number) + (sorted[mid][field] as number)) / 2;
}

