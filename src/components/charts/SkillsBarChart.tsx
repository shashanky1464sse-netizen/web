import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SkillsBarChartProps {
  data: { skill: string; value: number }[];
  title?: string;
}

export const SkillsBarChart: React.FC<SkillsBarChartProps> = ({ data, title = "Skills Practiced" }) => {
  return (
    <Card className="h-full w-full bg-surface border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis 
              dataKey="skill" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text)', fontSize: 13 }} 
              width={100} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-surface-2)' }} 
              contentStyle={{ backgroundColor: 'var(--color-surface-2)', border: 'none', borderRadius: '8px' }}
            />
            <Bar 
              dataKey="value" 
              fill="var(--color-primary)" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
