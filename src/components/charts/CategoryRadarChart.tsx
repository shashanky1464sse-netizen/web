import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryPerformanceItem } from '@/types/analytics.types';

interface CategoryRadarChartProps {
  data: CategoryPerformanceItem[];
}

export const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ data }) => {
  return (
    <Card className="h-full w-full bg-surface border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Category Mastery</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface-2)', border: 'none', borderRadius: '8px' }}
            />
            <Radar 
              name="Avg Score" 
              dataKey="avg_score" 
              stroke="var(--color-primary)" 
              fill="var(--color-primary)" 
              fillOpacity={0.4} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
