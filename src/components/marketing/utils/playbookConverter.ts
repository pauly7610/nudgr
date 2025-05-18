
import { MarketingPlaybook } from '../types/marketingPlaybookTypes';

export interface PlaybookType {
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
export const convertToMarketingPlaybook = (playbook: PlaybookType): MarketingPlaybook => {
  // Map friction type to allowed values in MarketingPlaybook
  let frictionType: MarketingPlaybook['frictionType'] = 'form_abandonment'; // Default value
  
  if (playbook.frictionType.includes('form_abandonment')) {
    frictionType = 'form_abandonment';
  } else if (playbook.frictionType.includes('rage_clicks')) {
    frictionType = 'rage_clicks';
  } else if (playbook.frictionType.includes('navigation_loops')) {
    frictionType = 'navigation_loops';
  } else if (playbook.frictionType.includes('excessive_scrolling')) {
    frictionType = 'excessive_scrolling';
  }

  return {
    id: playbook.id,
    title: playbook.title,
    description: playbook.description,
    category: playbook.category === 'form' ? 'signup' : 
              playbook.category === 'navigation' ? 'landing_page' :
              playbook.category === 'content' ? 'product' : 'checkout',
    frictionType: frictionType,
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
