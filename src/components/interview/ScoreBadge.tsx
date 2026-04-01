import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, className, size = 'md' }) => {
  let variantClass = '';
  
  if (score >= 70) {
    variantClass = 'bg-success/15 text-success hover:bg-success/25 border-success/30';
  } else if (score >= 50) {
    variantClass = 'bg-warning/15 text-warning hover:bg-warning/25 border-warning/30';
  } else {
    variantClass = 'bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30';
  }

  const sizeClass = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-1.5 text-base',
  }[size];

  return (
    <Badge variant="outline" className={cn('font-semibold font-syne', variantClass, sizeClass, className)}>
      {score}/100
    </Badge>
  );
};
