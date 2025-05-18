
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DocsNavigationProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const DocsNavigation: React.FC<DocsNavigationProps> = ({
  activeSection,
  onSelectSection
}) => {
  const links = [
    { title: 'Best Practices', href: '/library', value: 'playbooks' },
    { title: 'Cohort Comparison', href: '/library/cohort-comparison', value: 'cohort-comparison' },
    { title: 'Journey Mapping', href: '/library/journey-mapping', value: 'journey-mapping' },
    { title: 'Technical Guides', href: '/library/technical', value: 'technical' }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {links.map((link) => (
        <Button
          key={link.href}
          variant={link.value === activeSection ? "default" : "outline"}
          size="sm"
          asChild
          onClick={() => onSelectSection(link.value)}
        >
          <Link to={link.href}>{link.title}</Link>
        </Button>
      ))}
    </div>
  );
};
