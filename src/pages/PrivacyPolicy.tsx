import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader title="Privacy Policy" description="How Resume2Interview handles your data." />
      
      <Card className="bg-surface border-border mt-8">
        <CardContent className="p-6 sm:p-8 prose prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {[
            {
              title: "1. Data We Collect",
              body: "We collect your name, email address, and password (hashed) at registration. When you upload a resume, we process it with NLP tools to extract relevant skills and work experience. Your interview responses are processed through AI solely for evaluation purposes."
            },
            {
              title: "2. How We Use Your Data",
              body: "Your data is used exclusively to provide the interview simulation service, generate performance analytics, and improve your personal experience. We do not sell or share your data with third-party advertisers."
            },
            {
              title: "3. Data Retention",
              body: "Interview reports and resume data are retained as long as your account is active. You may delete your account at any time, which will permanently remove all associated data."
            },
            {
              title: "4. Security",
              body: "All data is transmitted over HTTPS. Passwords are never stored in plain text and are hashed using industry-standard bcrypt. We employ standard database security practices to protect your information."
            },
            {
              title: "5. Contact",
              body: "For any privacy-related questions, please reach out to shashankyerragunta22@gmail.com."
            }
          ].map((section, i) => (
            <React.Fragment key={i}>
              <h3 className="text-lg font-syne font-semibold mt-6 mb-2 text-foreground">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              {i < 4 && <Separator className="my-4 bg-border/50" />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
