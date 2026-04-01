import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Info } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader title="Notifications" description="Manage your notification preferences and history." />
      <Card className="bg-surface border-border mt-8">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-syne font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground max-w-sm">
            You&apos;re all caught up. Activity notifications such as interview evaluation completions will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
