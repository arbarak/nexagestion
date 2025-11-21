export interface DeviceInfo {
  userAgent: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

export interface MobileOptimization {
  id: string;
  companyId: string;
  feature: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export class MobileOptimizationService {
  private optimizations: Map<string, MobileOptimization> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];

  async detectDevice(userAgent: string): Promise<DeviceInfo> {
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent);
    const isTablet = /iPad|Android/.test(userAgent) && !/Mobile/.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    return {
      userAgent,
      isMobile,
      isTablet,
      isDesktop,
      platform: this.getPlatform(userAgent),
      screenWidth: 0,
      screenHeight: 0,
      devicePixelRatio: 1,
    };
  }

  private getPlatform(userAgent: string): string {
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  async enableOptimization(
    companyId: string,
    feature: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<MobileOptimization> {
    const optimization: MobileOptimization = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      feature,
      enabled: true,
      priority,
      lastUpdated: new Date(),
    };

    this.optimizations.set(optimization.id, optimization);
    console.log(`Enabled optimization: ${feature}`);
    return optimization;
  }

  async disableOptimization(companyId: string, feature: string): Promise<void> {
    for (const [id, opt] of this.optimizations) {
      if (opt.companyId === companyId && opt.feature === feature) {
        opt.enabled = false;
        opt.lastUpdated = new Date();
        this.optimizations.set(id, opt);
        console.log(`Disabled optimization: ${feature}`);
      }
    }
  }

  async getOptimizations(companyId: string): Promise<MobileOptimization[]> {
    return Array.from(this.optimizations.values()).filter(
      (opt) => opt.companyId === companyId
    );
  }

  async recordPerformanceMetric(
    metric: string,
    value: number,
    unit: string
  ): Promise<void> {
    this.performanceMetrics.push({
      metric,
      value,
      unit,
      timestamp: new Date(),
    });

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  async getPerformanceMetrics(
    metric?: string,
    limit: number = 100
  ): Promise<PerformanceMetric[]> {
    let metrics = this.performanceMetrics;

    if (metric) {
      metrics = metrics.filter((m) => m.metric === metric);
    }

    return metrics.slice(-limit);
  }

  async getPerformanceStats(): Promise<{
    averageLoadTime: number;
    averageFirstPaint: number;
    averageFirstContentfulPaint: number;
    averageLargestContentfulPaint: number;
  }> {
    const loadTimes = this.performanceMetrics
      .filter((m) => m.metric === 'loadTime')
      .map((m) => m.value);

    const firstPaints = this.performanceMetrics
      .filter((m) => m.metric === 'firstPaint')
      .map((m) => m.value);

    const fcps = this.performanceMetrics
      .filter((m) => m.metric === 'firstContentfulPaint')
      .map((m) => m.value);

    const lcps = this.performanceMetrics
      .filter((m) => m.metric === 'largestContentfulPaint')
      .map((m) => m.value);

    const average = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      averageLoadTime: average(loadTimes),
      averageFirstPaint: average(firstPaints),
      averageFirstContentfulPaint: average(fcps),
      averageLargestContentfulPaint: average(lcps),
    };
  }

  async getResponsiveBreakpoints(): Promise<Record<string, number>> {
    return {
      mobile: 320,
      mobileLandscape: 568,
      tablet: 768,
      desktop: 1024,
      widescreen: 1216,
      fullhd: 1408,
    };
  }

  async optimizeImageForDevice(
    imageUrl: string,
    deviceType: 'mobile' | 'tablet' | 'desktop'
  ): Promise<string> {
    const sizes: Record<string, string> = {
      mobile: '?w=480&q=75',
      tablet: '?w=768&q=80',
      desktop: '?w=1024&q=85',
    };

    return imageUrl + (sizes[deviceType] || '');
  }

  async getOptimizationRecommendations(
    companyId: string
  ): Promise<Array<{ feature: string; reason: string; priority: string }>> {
    const recommendations = [
      {
        feature: 'Image Optimization',
        reason: 'Reduce image sizes for faster loading',
        priority: 'high',
      },
      {
        feature: 'Lazy Loading',
        reason: 'Load content on demand',
        priority: 'high',
      },
      {
        feature: 'Code Splitting',
        reason: 'Reduce initial bundle size',
        priority: 'medium',
      },
      {
        feature: 'Service Worker Caching',
        reason: 'Enable offline functionality',
        priority: 'medium',
      },
      {
        feature: 'Compression',
        reason: 'Reduce data transfer',
        priority: 'high',
      },
    ];

    return recommendations;
  }
}

export const mobileOptimizationService = new MobileOptimizationService();

