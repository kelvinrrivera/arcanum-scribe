import React from 'react';
import { cn } from '@/lib/utils';

export interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: number | string;
  as?: keyof JSX.IntrinsicElements;
}

export const Flex: React.FC<FlexProps> = ({ 
  children, 
  className,
  direction = 'row',
  align,
  justify,
  wrap,
  gap,
  as: Component = 'div'
}) => {
  const flexClasses = cn(
    'flex',
    direction && `flex-${direction}`,
    align && `items-${align}`,
    justify && `justify-${justify}`,
    wrap && `flex-${wrap}`,
    typeof gap === 'number' ? `gap-${gap}` : gap,
    className
  );

  return (
    <Component className={flexClasses}>
      {children}
    </Component>
  );
};