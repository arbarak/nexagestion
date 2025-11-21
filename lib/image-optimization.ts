export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  responsive?: boolean;
}

export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 800,
    height,
    quality = 75,
    format = "webp",
    responsive = true,
  } = options;

  // For Next.js Image Optimization
  const params = new URLSearchParams();
  params.append("url", src);
  params.append("w", width.toString());
  if (height) params.append("h", height.toString());
  params.append("q", quality.toString());
  params.append("f", format);

  return `/_next/image?${params.toString()}`;
}

export function getResponsiveImageSrcSet(
  src: string,
  sizes: number[] = [320, 640, 960, 1280]
): string {
  return sizes
    .map((size) => {
      const url = getOptimizedImageUrl(src, { width: size });
      return `${url} ${size}w`;
    })
    .join(", ");
}

export function getImageSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
}

export const imagePresets = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: "webp" as const,
  },
  card: {
    width: 400,
    height: 300,
    quality: 85,
    format: "webp" as const,
  },
  hero: {
    width: 1200,
    height: 600,
    quality: 90,
    format: "webp" as const,
  },
  avatar: {
    width: 64,
    height: 64,
    quality: 85,
    format: "webp" as const,
  },
  icon: {
    width: 32,
    height: 32,
    quality: 80,
    format: "webp" as const,
  },
};

export function getLazyLoadingAttributes() {
  return {
    loading: "lazy" as const,
    decoding: "async" as const,
  };
}

export function getBlurDataUrl(width: number = 10, height: number = 10): string {
  // Generate a simple blur placeholder
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return "";

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

