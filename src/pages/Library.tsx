
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BestPracticeLibrary } from '@/components/library/BestPracticeLibrary';
import { MarketingFrictionPlaybooks } from '@/components/marketing/MarketingFrictionPlaybooks';
import { TechnicalErrorCorrelation } from '@/components/TechnicalErrorCorrelation';
import { FrictionAudienceExport } from '@/components/marketing/FrictionAudienceExport';
import { BookOpen, BookText, AlertCircle, Users } from 'lucide-react';

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
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="best-practices" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Best Practices</span>
            </TabsTrigger>
            <TabsTrigger value="marketing-playbooks" className="flex items-center gap-1">
              <BookText className="h-4 w-4" />
              <span>Marketing Playbooks</span>
            </TabsTrigger>
            <TabsTrigger value="tech-errors" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>Tech Error Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="audience-export" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Audience Export</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <BestPracticeLibrary />
          </TabsContent>
          
          <TabsContent value="marketing-playbooks">
            <MarketingFrictionPlaybooks />
          </TabsContent>
          
          <TabsContent value="tech-errors">
            <TechnicalErrorCorrelation />
          </TabsContent>
          
          <TabsContent value="audience-export">
            <FrictionAudienceExport />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Library;
