
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocsNavigationProps {
  activePage: string;
}

export const DocsNavigation: React.FC<DocsNavigationProps> = ({
  activePage
}) => {
  const links = [
    { title: 'Best Practices', href: '/library' },
    { title: 'Cohort Comparison', href: '/library/cohort-comparison' },
    { title: 'Journey Mapping', href: '/library/journey-mapping' },
    { title: 'Technical Guides', href: '/library/technical' }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {links.map((link) => (
        <Button
          key={link.href}
          variant={link.href.includes(activePage) ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to={link.href}>{link.title}</Link>
        </Button>
      ))}
    </div>
  );
};
