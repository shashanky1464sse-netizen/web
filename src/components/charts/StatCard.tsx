import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend }) => {
  return (
    <Card className="bg-surface border-border hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-2xl font-bold text-foreground font-syne">{value}</div>
          
          {trend && (
            <p className="text-xs flex items-center gap-1 font-medium">
              <span className={trend.isPositive ? 'text-success' : 'text-destructive'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last 5</span>
            </p>
          )}
          
          {!trend && description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
