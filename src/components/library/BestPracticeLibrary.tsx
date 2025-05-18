
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BestPracticeLibraryProps {
  category: string;
}

export const BestPracticeLibrary: React.FC<BestPracticeLibraryProps> = ({ category }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Best Practices</h2>
        <p>Content for {category} best practices will be displayed here.</p>
      </CardContent>
    </Card>
  );
};
