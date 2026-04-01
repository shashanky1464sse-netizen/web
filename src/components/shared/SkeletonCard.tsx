import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <Card className={`border-border bg-surface ${className}`}>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-2/3 mb-4 bg-surface-2" />
        <Skeleton className="h-8 w-1/3 mb-6 bg-surface-2" />
        <Skeleton className="h-20 w-full mb-2 bg-surface-2" />
        <Skeleton className="h-20 w-full bg-surface-2" />
      </CardContent>
    </Card>
  );
};
