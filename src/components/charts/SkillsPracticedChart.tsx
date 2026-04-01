import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SkillsPracticedItem } from '@/types/analytics.types';

interface SkillsPracticedChartProps {
  data: SkillsPracticedItem[];
}

export const SkillsPracticedChart: React.FC<SkillsPracticedChartProps> = ({ data }) => {
  return (
    <Card className="h-full w-full bg-surface border-border overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-bold text-foreground">Skills Practiced</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Based on Interview question categories
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
            <XAxis 
              type="number"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} 
              domain={[0, 'dataMax']}
            />
            <YAxis 
              type="category"
              dataKey="skill" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 500 }} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--color-surface-2)' }}
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
              itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="question_count" 
              name="Questions"
              fill="var(--color-primary)" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
