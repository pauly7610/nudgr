export type FrictionType = 'rage_clicks' | 'form_abandonment' | 'navigation_loops' | 'excessive_scrolling';

export interface Step {
  label: string;
  users: number;
  dropOff?: number;
  friction?: FrictionType[];
}

export interface Flow {
  id: string;
  flow: string;
  steps: Step[];
}

export interface Alert {
  id: string;
  timestamp: Date;
  message: string;
  type: 'warning' | 'error';
  flowId: string;
  stepIndex: number;
}

export interface UserCohort {
  id: string;
  name: string;
  conversionRate: number;
  frictionScore: number;
  change: number;
}

// Add these new type definitions for the detailed journey
export interface DetailedAction {
  type: 'click' | 'view' | 'scroll' | 'form_input' | 'hover';
  element: string;
  description: string;
  timestamp: string;
  duration?: number; // in seconds
  hoverData?: {
    coordinates: string;
    dwellTime: number;
  };
}

export interface DetailedStep {
  page: string;
  url: string;
  actions: DetailedAction[];
  timeSpent: number; // in seconds
}

// Mock flow data
export const flowData: Flow[] = [
  {
    id: "flow-1",
    flow: "Free Trial Signup",
    steps: [
      { label: "Landing Page", users: 2000 },
      { label: "Pricing Page", users: 1500, dropOff: 500, friction: ["rage_clicks", "navigation_loops"] },
      { label: "Signup Form", users: 900, dropOff: 600, friction: ["form_abandonment"] },
      { label: "Email Verification", users: 750, dropOff: 150, friction: ["navigation_loops"] },
      { label: "Account Setup", users: 600, dropOff: 150, friction: ["form_abandonment", "excessive_scrolling"] }
    ]
  },
  {
    id: "flow-2",
    flow: "Enterprise Demo Request",
    steps: [
      { label: "Enterprise Page", users: 800 },
      { label: "Features Page", users: 700, dropOff: 100, friction: ["excessive_scrolling"] },
      { label: "Contact Form", users: 450, dropOff: 250, friction: ["form_abandonment", "rage_clicks"] },
      { label: "Schedule Demo", users: 350, dropOff: 100 },
      { label: "Demo Confirmation", users: 300, dropOff: 50 }
    ]
  },
  {
    id: "flow-3",
    flow: "Product Checkout",
    steps: [
      { label: "Product View", users: 1500 },
      { label: "Add to Cart", users: 900, dropOff: 600, friction: ["rage_clicks"] },
      { label: "View Cart", users: 800, dropOff: 100 },
      { label: "Checkout Form", users: 600, dropOff: 200, friction: ["form_abandonment", "navigation_loops"] },
      { label: "Payment", users: 450, dropOff: 150, friction: ["form_abandonment"] },
      { label: "Confirmation", users: 400, dropOff: 50 }
    ]
  }
];

// Mock alerts
export const initialAlerts: Alert[] = [
  {
    id: "alert-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    message: "65% drop-off on Trial Signup Step 2",
    type: "warning",
    flowId: "flow-1",
    stepIndex: 2
  },
  {
    id: "alert-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    message: "Rage clicks detected on Enterprise Contact Form",
    type: "error",
    flowId: "flow-2",
    stepIndex: 2
  },
  {
    id: "alert-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    message: "Form abandonment spike on Checkout Form",
    type: "warning",
    flowId: "flow-3",
    stepIndex: 3
  }
];

// Mock user cohort data
export const userCohorts: UserCohort[] = [
  {
    id: "cohort-1",
    name: "Free Users",
    conversionRate: 8.3,
    frictionScore: 65,
    change: -2.1
  },
  {
    id: "cohort-2",
    name: "Trial Users",
    conversionRate: 22.7,
    frictionScore: 43,
    change: 5.4
  },
  {
    id: "cohort-3",
    name: "Enterprise",
    conversionRate: 45.2,
    frictionScore: 27,
    change: 12.8
  }
];

// Function to generate a new random alert
export const generateRandomAlert = (): Alert => {
  const flowIndex = Math.floor(Math.random() * flowData.length);
  const flow = flowData[flowIndex];
  const stepIndex = 1 + Math.floor(Math.random() * (flow.steps.length - 1));
  const step = flow.steps[stepIndex];
  
  const frictionTypes = ["rage_clicks", "form_abandonment", "navigation_loops", "excessive_scrolling"];
  const randomFriction = frictionTypes[Math.floor(Math.random() * frictionTypes.length)];
  
  const dropOffPercentage = Math.floor(Math.random() * 30) + 40;
  const isHighSeverity = Math.random() < 0.3;
  
  const messages = [
    `${dropOffPercentage}% drop-off on ${flow.flow} at ${step.label}`,
    `${randomFriction.replace('_', ' ')} detected on ${flow.flow} at ${step.label}`,
    `Unusual user behavior on ${flow.flow} at ${step.label}`
  ];
  
  return {
    id: `alert-${Date.now()}`,
    timestamp: new Date(),
    message: messages[Math.floor(Math.random() * messages.length)],
    type: isHighSeverity ? "error" : "warning",
    flowId: flow.id,
    stepIndex
  };
};
