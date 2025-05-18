
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BookOpen } from 'lucide-react';
import { PlaybookFilter } from './components/PlaybookFilter';
import { PlaybookList } from './components/PlaybookList';
import { FrictionTags } from './components/FrictionTags';
import { PlaybookDetails } from './PlaybookDetails';
import { CustomPlaybookRequest } from './CustomPlaybookRequest';
import { PlaybookType, convertToMarketingPlaybook } from './utils/playbookConverter';
import { playbooks } from './data/playbooksData';
import { MarketingPlaybook } from './types/marketingPlaybookTypes';

export const MarketingPlaybooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Filter playbooks based on search term and category
  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          playbook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || playbook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).map(playbook => convertToMarketingPlaybook(playbook));
  
  // Get the selected playbook details
  const activePlaybook = playbooks.find(p => p.id === selectedPlaybook);
  const convertedActivePlaybook = activePlaybook ? convertToMarketingPlaybook(activePlaybook) : null;
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedPlaybook(null);
  };
  
  const handleSelectPlaybook = (playbook: MarketingPlaybook) => {
    setSelectedPlaybook(playbook.id);
    setShowRequestForm(false);
  };
  
  const handleBack = () => {
    setSelectedPlaybook(null);
    setShowRequestForm(false);
  };
  
  const handleShowRequestForm = () => {
    setShowRequestForm(true);
    setSelectedPlaybook(null);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Marketing Playbooks
        </CardTitle>
        <CardDescription>
          Best practices and solutions for common friction patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedPlaybook && !showRequestForm ? (
          <>
            <PlaybookFilter 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            
            <PlaybookList 
              playbooks={filteredPlaybooks}
              onViewPlaybook={handleSelectPlaybook}
              onRequestCustom={handleShowRequestForm}
            />
            
            <FrictionTags />
          </>
        ) : showRequestForm ? (
          <CustomPlaybookRequest onBack={handleBack} />
        ) : convertedActivePlaybook ? (
          <PlaybookDetails playbook={convertedActivePlaybook} onBack={handleBack} />
        ) : null}
      </CardContent>
    </Card>
  );
};
