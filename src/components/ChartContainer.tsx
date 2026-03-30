import React from 'react';

interface ChartContainerProps {
  height?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that gives Recharts' ResponsiveContainer a real measured size.
 *
 * The -1 width/height bug occurs when ResponsiveContainer's direct parent
 * has no explicit height (common in flex/grid layouts where height is
 * derived, not set). This component:
 *   - sets an explicit pixel height so ResizeObserver returns a real value
 *   - adds min-width:0 to prevent flex overflow from collapsing width to 0
 *   - adds position:relative which some recharts tooltips require
 */
export default function ChartContainer({
  height = 280,
  children,
  className = '',
}: ChartContainerProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height,
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
