import React from 'react';
import { motion } from 'framer-motion';

export interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}) => {
  return (
    <div
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
};

// Flexible Grid Item with span support
export interface GridItemProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6;
  rowSpan?: 1 | 2 | 3;
  className?: string;
}

const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
  4: 'col-span-1 md:col-span-2 lg:col-span-4',
  5: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5',
  6: 'col-span-full',
};

const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
}) => {
  return (
    <div
      className={`${colSpanClasses[colSpan]} ${rowSpanClasses[rowSpan]} ${className}`}
    >
      {children}
    </div>
  );
};
