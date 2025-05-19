
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, MousePointer2, Tag, Code } from 'lucide-react';
import { PlaybookFilter } from './components/PlaybookFilter';
import { PlaybookList } from './components/PlaybookList';
import { FrictionTags } from './components/FrictionTags';
import { PlaybookDetails } from './PlaybookDetails';
import { CustomPlaybookRequest } from './CustomPlaybookRequest';
import { PlaybookType, convertToMarketingPlaybook } from './utils/playbookConverter';
import { playbooks } from './data/playbooksData';
import { MarketingPlaybook } from './types/marketingPlaybookTypes';

interface MarketingPlaybooksProps {
  initialSearchTerm?: string;
}

export const MarketingPlaybooks: React.FC<MarketingPlaybooksProps> = ({ initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Update search term when prop changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);
  
  // Category filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'form', label: 'Forms', icon: MousePointer2 },
    { value: 'navigation', label: 'Navigation', icon: Tag },
    { value: 'content', label: 'Content', icon: BookOpen },
    { value: 'technical', label: 'Technical', icon: Code }
  ];
  
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
              filterOptions={filterOptions}
              variant="tabs"
              placeholder="Search playbooks..."
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
