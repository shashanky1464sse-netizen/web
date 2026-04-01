import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold font-syne tracking-tight text-foreground m-0 leading-tight">
          {title}
        </h1>
        {description && (
          <div className="text-muted-foreground mt-1 max-w-2xl">{description}</div>
        )}
      </div>
      
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
