
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BestPracticeLibrary } from '@/components/library/BestPracticeLibrary';
import { MarketingFrictionPlaybooks } from '@/components/marketing/MarketingFrictionPlaybooks';
import { BookOpen, BookText } from 'lucide-react';

const Library = () => {
  const [activeTab, setActiveTab] = useState<string>("best-practices");
  
  return (
    <>
      <DashboardHeader 
        title="Friction Pattern Library" 
        description="Best practices and playbooks to resolve user friction"
      />
      
      <div className="container py-8">
        <Tabs
          defaultValue="best-practices"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="best-practices" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Best Practices</span>
            </TabsTrigger>
            <TabsTrigger value="marketing-playbooks" className="flex items-center gap-1">
              <BookText className="h-4 w-4" />
              <span>Marketing Playbooks</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <BestPracticeLibrary />
          </TabsContent>
          
          <TabsContent value="marketing-playbooks">
            <MarketingFrictionPlaybooks />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Library;
