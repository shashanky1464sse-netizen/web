import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = "" }) => {
  return (
    <Card className={`border-dashed border-2 border-border bg-surface/50 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-syne font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
};
