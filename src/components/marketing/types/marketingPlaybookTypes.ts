
export interface MarketingPlaybook {
  id: string;
  title: string;
  description: string;
  category: 'landing_page' | 'checkout' | 'signup' | 'onboarding' | 'product';
  frictionType: 'form_abandonment' | 'rage_clicks' | 'navigation_loops' | 'excessive_scrolling';
  conversionLift: number;
  implementationTime: 'quick' | 'medium' | 'complex';
  steps: {
    title: string;
    description: string;
    status?: 'success' | 'warning' | 'info';
  }[];
  beforeAfterData?: {
    before: { name: string; value: number }[];
    after: { name: string; value: number }[];
  };
  relatedCases?: {
    company: string;
    industry: string;
    outcome: string;
  }[];
}

export const marketingPlaybooks: MarketingPlaybook[] = [
  {
    id: 'playbook-1',
    title: 'Form Simplification Strategy',
    description: 'Reduce form abandonment by simplifying the signup process and minimizing required fields.',
    category: 'signup',
    frictionType: 'form_abandonment',
    conversionLift: 23,
    implementationTime: 'quick',
    steps: [
      {
        title: 'Audit current form fields',
        description: 'Identify which fields are absolutely necessary vs. nice to have.',
        status: 'success'
      },
      {
        title: 'Implement progressive disclosure',
        description: 'Only show additional fields after core information is collected.',
        status: 'warning'
      },
      {
        title: 'Add inline validation',
        description: 'Validate fields as users type to prevent submission errors.',
        status: 'info'
      },
      {
        title: 'Implement social sign-up',
        description: 'Allow users to sign up with existing social accounts.',
      },
      {
        title: 'A/B test variations',
        description: 'Test different form layouts and field counts.',
      }
    ],
    beforeAfterData: {
      before: [
        { name: 'Visit', value: 100 },
        { name: 'Start', value: 72 },
        { name: 'Fill Name', value: 58 },
        { name: 'Fill Email', value: 47 },
        { name: 'Fill Password', value: 38 },
        { name: 'Fill Details', value: 26 },
        { name: 'Submit', value: 21 }
      ],
      after: [
        { name: 'Visit', value: 100 },
        { name: 'Start', value: 85 },
        { name: 'Fill Email', value: 74 },
        { name: 'Fill Password', value: 62 },
        { name: 'Submit', value: 54 }
      ]
    },
    relatedCases: [
      {
        company: 'TechStream',
        industry: 'SaaS',
        outcome: '28% increase in sign-up completions'
      },
      {
        company: 'ShopQuick',
        industry: 'E-commerce',
        outcome: '18% reduction in cart abandonment'
      }
    ]
  },
  {
    id: 'playbook-2',
    title: 'Landing Page Clarity Framework',
    description: 'Reduce bounce rates and rage clicks by implementing a clear value proposition and CTA structure.',
    category: 'landing_page',
    frictionType: 'rage_clicks',
    conversionLift: 18,
    implementationTime: 'medium',
    steps: [
      {
        title: 'Rewrite headline for clarity',
        description: 'Create a benefit-focused headline that immediately communicates value.',
        status: 'success'
      },
      {
        title: 'Simplify page navigation',
        description: 'Remove unnecessary menu items and focus on primary actions.',
        status: 'success'
      },
      {
        title: 'Enhance CTA visibility',
        description: 'Make CTAs stand out with contrasting colors and clear action text.',
        status: 'warning'
      },
      {
        title: 'Add social proof elements',
        description: 'Include testimonials, logos, or statistics to build credibility.',
      },
      {
        title: 'Optimize visual hierarchy',
        description: 'Ensure the most important elements get the most visual attention.',
      }
    ],
    beforeAfterData: {
      before: [
        { name: 'Visit', value: 100 },
        { name: 'Scroll', value: 65 },
        { name: 'CTA View', value: 48 },
        { name: 'CTA Click', value: 22 }
      ],
      after: [
        { name: 'Visit', value: 100 },
        { name: 'Scroll', value: 82 },
        { name: 'CTA View', value: 76 },
        { name: 'CTA Click', value: 41 }
      ]
    }
  },
  {
    id: 'playbook-3',
    title: 'Checkout Optimization Protocol',
    description: 'Increase checkout completion rates by streamlining the purchase process and reducing abandonment.',
    category: 'checkout',
    frictionType: 'navigation_loops',
    conversionLift: 31,
    implementationTime: 'complex',
    steps: [
      {
        title: 'Implement guest checkout option',
        description: 'Allow purchases without requiring account creation.',
        status: 'success'
      },
      {
        title: 'Add progress indicator',
        description: 'Show users where they are in the checkout process.',
        status: 'success'
      },
      {
        title: 'Optimize for mobile',
        description: 'Ensure the checkout flow works seamlessly on mobile devices.',
        status: 'warning'
      },
      {
        title: 'Add multiple payment options',
        description: 'Offer various payment methods including digital wallets.',
        status: 'info'
      },
      {
        title: 'Implement cart recovery',
        description: 'Add email reminders for abandoned carts.',
      }
    ],
    relatedCases: [
      {
        company: 'FashionNova',
        industry: 'Retail',
        outcome: '27% increase in checkout completion'
      },
      {
        company: 'GadgetWorld',
        industry: 'Electronics',
        outcome: '34% reduction in cart abandonment'
      }
    ]
  }
];
