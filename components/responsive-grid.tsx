import React from "react";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
}: ResponsiveGridProps) {
  const gridColsClass = {
    mobile: `grid-cols-${columns.mobile || 1}`,
    tablet: `md:grid-cols-${columns.tablet || 2}`,
    desktop: `lg:grid-cols-${columns.desktop || 3}`,
  };

  const gapClass = `gap-${gap}`;

  return (
    <div
      className={`grid ${gridColsClass.mobile} ${gridColsClass.tablet} ${gridColsClass.desktop} ${gapClass}`}
    >
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  padding?: number;
}

export function ResponsiveContainer({
  children,
  maxWidth = "2xl",
  padding = 4,
}: ResponsiveContainerProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const paddingClass = `p-${padding}`;

  return (
    <div className={`mx-auto ${maxWidthClass[maxWidth]} ${paddingClass}`}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: "row" | "col";
  gap?: number;
  responsive?: boolean;
}

export function ResponsiveStack({
  children,
  direction = "col",
  gap = 4,
  responsive = true,
}: ResponsiveStackProps) {
  const directionClass = direction === "row" ? "flex-row" : "flex-col";
  const responsiveClass = responsive ? "md:flex-row" : "";
  const gapClass = `gap-${gap}`;

  return (
    <div className={`flex ${directionClass} ${responsiveClass} ${gapClass}`}>
      {children}
    </div>
  );
}

