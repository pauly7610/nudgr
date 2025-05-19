
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Map, Code, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface DocsNavigationProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const DocsNavigation: React.FC<DocsNavigationProps> = ({
  activeSection,
  onSelectSection
}) => {
  const links = [
    { 
      title: 'Marketing Playbooks', 
      href: '/library', 
      value: 'playbooks',
      icon: BookOpen,
      description: 'Strategies to optimize marketing flows'
    },
    { 
      title: 'Cohort Comparison', 
      href: '/library/cohort-comparison', 
      value: 'cohort-comparison',
      icon: Users,
      description: 'Compare different user segments'
    },
    { 
      title: 'Journey Mapping', 
      href: '/library/journey-mapping', 
      value: 'journey-mapping',
      icon: Map,
      description: 'Best practices for mapping user journeys'
    },
    { 
      title: 'Technical Guides', 
      href: '/library/technical', 
      value: 'technical',
      icon: Code,
      description: 'Technical implementation guides'
    }
  ];
  
  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <TooltipProvider key={link.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={link.value === activeSection ? "default" : "outline"}
                className={`justify-start ${link.value === activeSection ? "" : "bg-transparent"} w-full`}
                onClick={() => onSelectSection(link.value)}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.title}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{link.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      <div className="mt-6 p-3 bg-muted rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Need Help?</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Can't find what you're looking for? Use the custom request form in the Marketing Playbooks section.
        </p>
      </div>
    </div>
  );
};
