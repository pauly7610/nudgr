
import { PlaybookType } from '../utils/playbookConverter';

export const playbooks: PlaybookType[] = [
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
