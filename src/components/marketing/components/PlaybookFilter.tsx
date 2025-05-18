
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MousePointer2, Tag, BookOpen, Code } from 'lucide-react';

interface PlaybookFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const PlaybookFilter: React.FC<PlaybookFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search playbooks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={onCategoryChange} className="mb-6">
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
    </>
  );
};
