import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  as?: keyof JSX.IntrinsicElements;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  as: Component = 'div'
}) => {
  const gridClasses = cn(
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    typeof gap === 'number' ? `gap-${gap}` : gap,
    className
  );

  return (
    <Component className={gridClasses}>
      {children}
    </Component>
  );
};