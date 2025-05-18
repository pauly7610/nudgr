
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CustomPlaybookRequest: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Need a Custom Playbook?</CardTitle>
        <CardDescription>
          Our team can create a custom marketing friction playbook tailored to your specific challenges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full flex items-center justify-center gap-1">
          Request Custom Playbook <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
