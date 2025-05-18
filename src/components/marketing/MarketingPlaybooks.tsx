
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, Filter, BookOpen, Tag, MousePointer2, AlertTriangle, Code } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { PlaybookCard } from './PlaybookCard';
import { PlaybookDetails } from './PlaybookDetails';
import { CustomPlaybookRequest } from './CustomPlaybookRequest';
import { MarketingPlaybook, marketingPlaybooks } from './types/marketingPlaybookTypes';

interface PlaybookType {
  id: string;
  title: string;
  description: string;
  category: 'form' | 'navigation' | 'content' | 'technical';
  frictionType: string[];
  previewImage?: string;
  popularity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedLift: string;
}

// Adapter to convert PlaybookType to MarketingPlaybook
const convertToMarketingPlaybook = (playbook: PlaybookType): MarketingPlaybook => {
  return {
    id: playbook.id,
    title: playbook.title,
    description: playbook.description,
    category: playbook.category === 'form' ? 'signup' : 
              playbook.category === 'navigation' ? 'landing_page' :
              playbook.category === 'content' ? 'product' : 'checkout',
    frictionType: playbook.frictionType[0],
    conversionLift: parseInt(playbook.estimatedLift.split('-')[1]) || 15,
    implementationTime: playbook.difficulty === 'easy' ? 'quick' : 
                       playbook.difficulty === 'medium' ? 'medium' : 'complex',
    steps: [
      {
        title: 'Analyze friction points',
        description: 'Identify the root cause of friction',
        status: 'success'
      },
      {
        title: 'Implement solution',
        description: 'Apply best practices to resolve the issue',
        status: 'warning'
      },
      {
        title: 'Monitor results',
        description: 'Track key metrics to verify improvement'
      }
    ]
  };
};

export const MarketingPlaybooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const playbooks: PlaybookType[] = [
    {
      id: 'playbook-1',
      title: 'Form Field Optimization',
      description: 'Reduce form abandonment by optimizing field count and layout',
      category: 'form',
      frictionType: ['form_abandonment', 'excessive_fields'],
      popularity: 98,
      difficulty: 'medium',
      estimatedLift: '15-25%'
    },
    {
      id: 'playbook-2',
      title: 'Navigation Simplification',
      description: 'Simplify navigation patterns to prevent user confusion',
      category: 'navigation',
      frictionType: ['navigation_loops', 'excessive_scrolling'],
      popularity: 85,
      difficulty: 'medium',
      estimatedLift: '10-15%'
    },
    {
      id: 'playbook-3',
      title: 'Pricing Table Clarity',
      description: 'Optimize pricing tables to reduce hesitation and confusion',
      category: 'content',
      frictionType: ['rage_clicks', 'comparison_difficulty'],
      popularity: 92,
      difficulty: 'easy',
      estimatedLift: '12-18%'
    },
    {
      id: 'playbook-4',
      title: 'Mobile UX Patterns',
      description: 'Best practices for friction-free mobile experiences',
      category: 'navigation',
      frictionType: ['excessive_scrolling', 'navigation_loops'],
      popularity: 90,
      difficulty: 'medium',
      estimatedLift: '8-14%'
    },
    {
      id: 'playbook-5',
      title: 'Page Speed Optimization',
      description: 'Reduce technical friction from slow-loading elements',
      category: 'technical',
      frictionType: ['page_abandonment', 'slow_loading'],
      popularity: 95,
      difficulty: 'hard',
      estimatedLift: '20-30%'
    },
    {
      id: 'playbook-6',
      title: 'Error Message Refinement',
      description: 'Improve form error messaging to aid completion',
      category: 'form',
      frictionType: ['form_abandonment', 'error_confusion'],
      popularity: 88,
      difficulty: 'easy',
      estimatedLift: '5-15%'
    }
  ];
  
  // Filter playbooks based on search term and category
  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          playbook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || playbook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get the selected playbook details
  const activePlaybook = playbooks.find(p => p.id === selectedPlaybook);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedPlaybook(null);
  };
  
  const handleSelectPlaybook = (id: string) => {
    setSelectedPlaybook(id);
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
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'form':
        return <MousePointer2 className="h-4 w-4" />;
      case 'navigation':
        return <Tag className="h-4 w-4" />;
      case 'content':
        return <BookOpen className="h-4 w-4" />;
      case 'technical':
        return <Code className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
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
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search playbooks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={selectedCategory} onValueChange={handleCategoryChange} className="mb-6">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="form" className="flex items-center gap-1">
                  <MousePointer2 className="h-3.5 w-3.5" />
                  <span>Forms</span>
                </TabsTrigger>
                <TabsTrigger value="navigation" className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Navigation</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-1">
                  <Code className="h-3.5 w-3.5" />
                  <span>Technical</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Recommended Playbooks</h3>
                <Button variant="ghost" size="sm" className="h-7" onClick={handleShowRequestForm}>
                  Request Custom
                </Button>
              </div>
              
              <ScrollArea className="h-[380px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-4">
                  {filteredPlaybooks.map((playbook) => (
                    <PlaybookCard 
                      key={playbook.id}
                      playbook={convertToMarketingPlaybook(playbook)}
                      onViewPlaybook={() => handleSelectPlaybook(playbook.id)}
                    />
                  ))}
                  
                  {filteredPlaybooks.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center py-8 text-center text-muted-foreground">
                      <div>
                        <p>No playbooks match your search</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Common Friction Types</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Form Abandonment</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Rage Clicks</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Navigation Loops</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Pricing Confusion</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted/50">Mobile UX</Badge>
              </div>
            </div>
          </>
        ) : showRequestForm ? (
          <CustomPlaybookRequest onBack={handleBack} />
        ) : activePlaybook ? (
          <PlaybookDetails playbook={convertToMarketingPlaybook(activePlaybook)} />
        ) : null}
      </CardContent>
    </Card>
  );
};
