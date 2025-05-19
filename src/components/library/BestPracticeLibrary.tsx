import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRight, BookOpen, FileText, Map, Code } from 'lucide-react';

export interface BestPracticeLibraryProps {
  category: string;
  searchTerm?: string;
}

export const BestPracticeLibrary: React.FC<BestPracticeLibraryProps> = ({ category, searchTerm = '' }) => {
  // Sample best practices data
  const bestPractices = [
    {
      id: 'bp1',
      title: 'User Journey Mapping Guide',
      description: 'Learn how to create effective user journey maps to identify friction points',
      category: 'journey-mapping',
      tags: ['journey', 'mapping', 'ux'],
      lastUpdated: '2023-05-15'
    },
    {
      id: 'bp2',
      title: 'Customer Segmentation Best Practices',
      description: 'Strategies for effective customer segmentation to reduce friction',
      category: 'journey-mapping',
      tags: ['segmentation', 'personas', 'analytics'],
      lastUpdated: '2023-06-22'
    },
    {
      id: 'bp3',
      title: 'API Integration Guidelines',
      description: 'Best practices for integrating third-party APIs with minimal friction',
      category: 'technical',
      tags: ['api', 'integration', 'development'],
      lastUpdated: '2023-04-10'
    },
    {
      id: 'bp4',
      title: 'Performance Optimization Guide',
      description: 'Techniques to optimize website performance and reduce user friction',
      category: 'technical',
      tags: ['performance', 'optimization', 'speed'],
      lastUpdated: '2023-07-05'
    },
    {
      id: 'bp5',
      title: 'Multi-step Form Design',
      description: 'Design principles for creating frictionless multi-step forms',
      category: 'journey-mapping',
      tags: ['forms', 'design', 'ux'],
      lastUpdated: '2023-03-18'
    },
    {
      id: 'bp6',
      title: 'Error Handling Framework',
      description: 'A comprehensive approach to handling errors with minimal user friction',
      category: 'technical',
      tags: ['errors', 'validation', 'ux'],
      lastUpdated: '2023-05-30'
    }
  ];

  // Filter best practices based on category and search term
  const filteredPractices = bestPractices.filter(practice => {
    const matchesCategory = practice.category === category;
    const matchesSearch = searchTerm === '' || 
      practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Get the appropriate icon based on category
  const getCategoryIcon = () => {
    switch(category) {
      case 'journey-mapping':
        return <Map className="h-5 w-5 text-primary" />;
      case 'technical':
        return <Code className="h-5 w-5 text-primary" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  // Get the category display name
  const getCategoryDisplayName = () => {
    switch(category) {
      case 'journey-mapping':
        return 'Journey Mapping Guides';
      case 'technical':
        return 'Technical Documentation';
      default:
        return 'Best Practices';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCategoryIcon()}
          {getCategoryDisplayName()}
        </CardTitle>
        <CardDescription>
          Best practices and guidelines for {category === 'journey-mapping' ? 'mapping user journeys' : 'technical implementation'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredPractices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No resources found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPractices.map(practice => (
              <Card key={practice.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{practice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1">
                      {practice.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                  Last updated: {practice.lastUpdated}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
