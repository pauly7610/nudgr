
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PlaybookCard } from './PlaybookCard';
import { PlaybookDetails } from './PlaybookDetails';
import { MarketingInsights } from './MarketingInsights';
import { CustomPlaybookRequest } from './CustomPlaybookRequest';
import { MarketingPlaybook, marketingPlaybooks } from './types/marketingPlaybookTypes';

export const MarketingFrictionPlaybooks: React.FC = () => {
  const [activePlaybook, setActivePlaybook] = useState<MarketingPlaybook | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Marketing Friction Playbooks</h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="landing_page">Landing Pages</TabsTrigger>
          <TabsTrigger value="signup">Sign-up</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingPlaybooks.map((playbook) => (
              <PlaybookCard 
                key={playbook.id} 
                playbook={playbook} 
                onViewPlaybook={setActivePlaybook} 
              />
            ))}
          </div>
        </TabsContent>
        
        {['landing_page', 'signup', 'checkout', 'onboarding'].map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingPlaybooks
                .filter(p => p.category === category)
                .map((playbook) => (
                  <PlaybookCard 
                    key={playbook.id} 
                    playbook={playbook} 
                    onViewPlaybook={setActivePlaybook} 
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <MarketingInsights />
      
      <CustomPlaybookRequest />
      
      <Sheet>
        <SheetTrigger className="hidden" />
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
          <PlaybookDetails playbook={activePlaybook} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
