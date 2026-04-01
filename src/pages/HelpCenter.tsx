import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  { q: "How does Resume2Interview generate questions?", a: "We use a multi-step AI pipeline. First, your PDF resume is parsed with spaCy NLP to extract your skills, experience level, and target role. Then a generative AI model (via NVIDIA NIM API) crafts unique technical interview questions specific to your claimed expertise." },
  { q: "How is my answer evaluated?", a: "Your spoken (or typed) response is sent to our AI evaluation API, which scores it on technical accuracy (0–100), provides natural language feedback, and lists specific strengths and improvements related to your answer." },
  { q: "Is my data private?", a: "Yes. Your resume content and interview data are stored securely and associated only with your account. We do not share your data with third parties." },
  { q: "What browsers support voice input?", a: "The Web Speech API used for speech-to-text is fully supported on Google Chrome (desktop) and Microsoft Edge. Type-only mode works on all modern browsers." },
  { q: "Can I retake an interview?", a: "Yes — simply upload your resume again or revisit the Resume Skills page to generate a fresh set of questions at any time." },
];

const HelpCenter: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader
        title="Help Center"
        description="Answers to the most common questions about Resume2Interview."
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 bg-surface">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Questions? Email</span>
            <a href="mailto:support@r2i.app" className="text-primary hover:underline">support@r2i.app</a>
          </div>
        }
      />

      <Card className="bg-surface border-border mt-8">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="space-y-1">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/50 last:border-0">
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;
