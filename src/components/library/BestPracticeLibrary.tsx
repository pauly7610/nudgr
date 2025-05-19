
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Download, Search, Filter } from 'lucide-react';

interface BestPracticeItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  documentType: 'guide' | 'template' | 'example' | 'reference';
  lastUpdated: string;
  url?: string;
}

interface BestPracticeLibraryProps {
  category: string;
}

// Mock data for Journey Mapping resources
const journeyMappingData: BestPracticeItem[] = [
  {
    id: 'journey-1',
    title: 'E-commerce User Journey Map Template',
    description: 'A comprehensive template for mapping the customer journey in e-commerce applications, including key touchpoints and common friction points.',
    tags: ['e-commerce', 'template', 'beginner'],
    documentType: 'template',
    lastUpdated: '2024-05-01'
  },
  {
    id: 'journey-2',
    title: 'SaaS Onboarding Journey Analysis',
    description: 'Detailed analysis of optimal user onboarding flows for SaaS products with real-world examples and benchmarks.',
    tags: ['saas', 'onboarding', 'analysis'],
    documentType: 'guide',
    lastUpdated: '2024-04-23'
  },
  {
    id: 'journey-3',
    title: 'Mobile App User Journey Framework',
    description: 'Framework for creating and analyzing user journeys in mobile applications, with focus on retention and engagement.',
    tags: ['mobile', 'framework', 'engagement'],
    documentType: 'guide',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'journey-4',
    title: 'B2B Sales Journey Mapping Process',
    description: 'Step-by-step process for mapping complex B2B customer journeys across multiple touchpoints and stakeholders.',
    tags: ['b2b', 'sales', 'process'],
    documentType: 'example',
    lastUpdated: '2024-04-10'
  },
  {
    id: 'journey-5',
    title: 'Customer Journey Analytics Dashboard Template',
    description: 'Excel/Google Sheets template for visualizing and analyzing customer journey metrics from multiple data sources.',
    tags: ['analytics', 'dashboard', 'template'],
    documentType: 'template',
    lastUpdated: '2024-05-10',
    url: '#'
  }
];

// Mock data for Technical Guides
const technicalGuidesData: BestPracticeItem[] = [
  {
    id: 'tech-1',
    title: 'API Performance Optimization Guide',
    description: 'Best practices for optimizing API response times and handling high-traffic scenarios efficiently.',
    tags: ['api', 'performance', 'optimization'],
    documentType: 'guide',
    lastUpdated: '2024-05-05'
  },
  {
    id: 'tech-2',
    title: 'Frontend Error Tracking Implementation',
    description: 'Comprehensive guide to implementing robust client-side error tracking and correlation with user friction events.',
    tags: ['frontend', 'error-tracking', 'monitoring'],
    documentType: 'guide',
    lastUpdated: '2024-04-18'
  },
  {
    id: 'tech-3',
    title: 'Mobile Performance Testing Framework',
    description: 'Framework and tools for identifying and resolving performance bottlenecks in mobile web applications.',
    tags: ['mobile', 'performance', 'testing'],
    documentType: 'reference',
    lastUpdated: '2024-03-27'
  },
  {
    id: 'tech-4',
    title: 'Database Query Optimization Patterns',
    description: 'Common patterns and solutions for optimizing database queries that impact application performance.',
    tags: ['database', 'optimization', 'patterns'],
    documentType: 'reference',
    lastUpdated: '2024-04-30'
  },
  {
    id: 'tech-5',
    title: 'CDN Configuration Best Practices',
    description: 'Best practices for configuring CDNs to minimize content delivery latency and improve loading times.',
    tags: ['cdn', 'performance', 'configuration'],
    documentType: 'guide',
    lastUpdated: '2024-04-12'
  }
];

export const BestPracticeLibrary: React.FC<BestPracticeLibraryProps> = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Select the appropriate data based on the category
  const allData = category === 'journey-mapping' 
    ? journeyMappingData 
    : category === 'technical' 
      ? technicalGuidesData 
      : [];
  
  // Filter data based on search and type filter
  const filteredData = allData.filter(item => {
    const matchesSearch = searchTerm === '' || 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    const matchesType = selectedType === null || item.documentType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getDocumentTypeColor = (type: string): string => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'template': return 'bg-green-100 text-green-800';
      case 'example': return 'bg-purple-100 text-purple-800';
      case 'reference': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get unique document types for filtering
  const documentTypes = [...new Set(allData.map(item => item.documentType))];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {category === 'journey-mapping' ? 'Journey Mapping Resources' : 'Technical Documentation'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {category === 'journey-mapping' 
                ? 'Best practices and templates for mapping user journeys and identifying friction points' 
                : 'Technical guides and reference documents for resolving friction issues'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="pl-8 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm"
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value === '' ? null : e.target.value)}
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline" className={getDocumentTypeColor(item.documentType)}>
                    {item.documentType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated: {item.lastUpdated}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                    {item.url && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground mb-2">No resources match your search criteria</p>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm('');
              setSelectedType(null);
            }}>
              Clear filters
            </Button>
          </div>
        )}
        
        {category === 'journey-mapping' && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-medium mb-2">How to use Journey Mapping resources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These resources will help you map out user journeys, identify friction points, 
              and implement strategies to improve user experiences across your application.
            </p>
            <div className="text-sm">
              <p className="mb-1"><strong>Guides</strong>: Step-by-step instructions and methodologies</p>
              <p className="mb-1"><strong>Templates</strong>: Ready-to-use frameworks and structures</p>
              <p className="mb-1"><strong>Examples</strong>: Real-world implementations and case studies</p>
              <p><strong>References</strong>: Comprehensive documentation and standards</p>
            </div>
          </div>
        )}
        
        {category === 'technical' && (
          <div className="mt-6 p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-medium mb-2">How to use Technical resources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These resources provide technical guidance for resolving friction issues, 
              optimizing performance, and implementing best practices in your application.
            </p>
            <div className="text-sm">
              <p className="mb-1"><strong>Guides</strong>: Step-by-step technical implementation instructions</p>
              <p className="mb-1"><strong>Templates</strong>: Code snippets and implementation patterns</p>
              <p className="mb-1"><strong>Examples</strong>: Sample implementations and proofs of concept</p>
              <p><strong>References</strong>: Technical specifications and API documentation</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
