
import React, { useState } from 'react';
import { Flow, FrictionType } from '../data/mockData';
import { ArrowRight, AlertCircle, Tag, MousePointerClick, Eye, ChevronDown, ChevronUp, MousePointer } from 'lucide-react';
import { Button } from './ui/button';

interface JourneyFrictionMapProps {
  flow: Flow | null;
  cohortId?: string | null;
}

interface DetailedAction {
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

interface DetailedStep {
  page: string;
  url: string;
  actions: DetailedAction[];
  timeSpent: number; // in seconds
}

export const JourneyFrictionMap: React.FC<JourneyFrictionMapProps> = ({ flow, cohortId }) => {
  const [showMarketingData, setShowMarketingData] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  
  // Mock detailed journey data - in a real app this would come from backend
  const mockDetailedJourney: Record<string, DetailedStep[]> = {
    'flow-1': [
      {
        page: 'Home Page',
        url: '/home',
        actions: [
          { type: 'view', element: 'hero_banner', description: 'Viewed hero banner', timestamp: '00:00' },
          { 
            type: 'hover', 
            element: 'navigation_menu', 
            description: 'Hovered over main navigation menu', 
            timestamp: '00:08',
            duration: 4,
            hoverData: {
              coordinates: 'nav:rewards',
              dwellTime: 3.2
            }
          },
          { type: 'click', element: 'rewards_link', description: 'Clicked "Chase Rewards" link in main navigation', timestamp: '00:12' }
        ],
        timeSpent: 45
      },
      {
        page: 'Rewards Dashboard',
        url: '/rewards',
        actions: [
          { type: 'view', element: 'rewards_summary', description: 'Viewed rewards points summary', timestamp: '00:46' },
          { 
            type: 'view', 
            element: 'travel_ad_banner', 
            description: 'Saw promotional banner for travel rewards', 
            timestamp: '01:03' 
          },
          { 
            type: 'hover', 
            element: 'travel_promo_cta', 
            description: 'Hovered over "Explore Travel Offers" CTA', 
            timestamp: '01:10',
            duration: 5,
            hoverData: {
              coordinates: 'banner:cta-button',
              dwellTime: 4.8
            }
          },
          { 
            type: 'click', 
            element: 'travel_promo_cta', 
            description: 'Clicked "Explore Travel Offers" CTA button', 
            timestamp: '01:15' 
          }
        ],
        timeSpent: 80
      },
      {
        page: 'Travel Rewards',
        url: '/rewards/travel',
        actions: [
          { 
            type: 'view', 
            element: 'flight_deals', 
            description: 'Viewed flight deals section', 
            timestamp: '01:36' 
          },
          { 
            type: 'scroll', 
            element: 'page_content', 
            description: 'Scrolled down to hotel offers', 
            timestamp: '01:52' 
          },
          { 
            type: 'hover', 
            element: 'premium_hotel_images', 
            description: 'Hovered over premium hotel images', 
            timestamp: '02:05',
            duration: 8,
            hoverData: {
              coordinates: 'hotels:carousel:hawaii',
              dwellTime: 7.5
            }
          },
          { 
            type: 'view', 
            element: 'premium_hotels', 
            description: 'Spent 25s viewing premium hotel offers', 
            timestamp: '02:08', 
            duration: 25 
          },
          { 
            type: 'click', 
            element: 'hotel_details_button', 
            description: 'Clicked on "Hawaii Resort" details', 
            timestamp: '02:33' 
          }
        ],
        timeSpent: 135
      },
      {
        page: 'Hotel Details',
        url: '/rewards/travel/hotels/hawaii-resort',
        actions: [
          { 
            type: 'view', 
            element: 'hotel_gallery', 
            description: 'Viewed hotel photo gallery', 
            timestamp: '02:40' 
          },
          { 
            type: 'hover', 
            element: 'room_options', 
            description: 'Hovered over different room types', 
            timestamp: '02:55',
            duration: 10,
            hoverData: {
              coordinates: 'rooms:premium-suite',
              dwellTime: 8.2
            }
          },
          { 
            type: 'view', 
            element: 'points_required', 
            description: 'Viewed points required section', 
            timestamp: '03:05' 
          },
          { 
            type: 'form_input', 
            element: 'date_selector', 
            description: 'Selected dates for potential booking', 
            timestamp: '03:22' 
          },
          { 
            type: 'click', 
            element: 'availability_button', 
            description: 'Clicked "Check Availability" button', 
            timestamp: '03:38' 
          }
        ],
        timeSpent: 115
      },
      {
        page: 'Booking Form',
        url: '/rewards/travel/hotels/hawaii-resort/book',
        actions: [
          { 
            type: 'form_input', 
            element: 'guest_details', 
            description: 'Started filling guest information form', 
            timestamp: '03:55' 
          },
          { 
            type: 'hover', 
            element: 'redemption_options', 
            description: 'Compared different redemption options', 
            timestamp: '04:05',
            duration: 7,
            hoverData: {
              coordinates: 'form:redemption-table',
              dwellTime: 6.8
            }
          },
          { 
            type: 'view', 
            element: 'points_summary', 
            description: 'Viewed points summary for booking', 
            timestamp: '04:12' 
          },
          { 
            type: 'scroll', 
            element: 'page_content', 
            description: 'Scrolled to terms and conditions', 
            timestamp: '04:35' 
          }
        ],
        timeSpent: 95
      }
    ],
    'flow-2': [
      {
        page: 'Landing Page',
        url: '/special-offer',
        actions: [
          { type: 'view', element: 'promo_banner', description: 'Viewed promotional banner', timestamp: '00:00' },
          { type: 'click', element: 'learn_more_button', description: 'Clicked "Learn More" button', timestamp: '00:18' }
        ],
        timeSpent: 35
      },
      {
        page: 'Product Page',
        url: '/products/premium-card',
        actions: [
          { type: 'view', element: 'feature_list', description: 'Viewed card features and benefits', timestamp: '00:36' },
          { type: 'scroll', element: 'page_content', description: 'Scrolled through entire benefits section', timestamp: '00:55' },
          { type: 'click', element: 'apply_now_button', description: 'Clicked "Apply Now" button', timestamp: '01:22' }
        ],
        timeSpent: 105
      }
    ]
  };

  if (!flow) {
    return (
      <div className="rounded-lg border bg-card h-96 flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Select a Journey to View</h3>
          <p className="text-muted-foreground">Click on any flow in the dashboard to view its journey friction map</p>
        </div>
      </div>
    );
  }

  // Helper to format friction types for display
  const formatFrictionType = (type: FrictionType): string => {
    switch(type) {
      case 'rage_clicks':
        return 'Rage Clicks';
      case 'form_abandonment':
        return 'Form Abandonment';
      case 'navigation_loops':
        return 'Navigation Loops';
      case 'excessive_scrolling':
        return 'Excessive Scrolling';
      default:
        return type;
    }
  };

  // Get detailed journey for current flow
  const detailedJourney = mockDetailedJourney[flow.id] || [];
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render action icon based on type
  const renderActionIcon = (type: DetailedAction['type']) => {
    switch (type) {
      case 'click':
        return <MousePointerClick className="h-3 w-3" />;
      case 'view':
        return <Eye className="h-3 w-3" />;
      case 'scroll':
        return <ChevronDown className="h-3 w-3" />;
      case 'form_input':
        return <ChevronUp className="h-3 w-3" />;
      case 'hover':
        return <MousePointer className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Mock marketing data - in a real app this would come from the backend
  const mockMarketingData = {
    campaignName: "Summer Sale 2023",
    source: "Google Ads",
    medium: "CPC",
    adGroup: "Product X - High Intent",
    adCreative: "50% Off Limited Time",
    landingPage: "/summer-promo"
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{flow.flow} - Journey Friction Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Showing full funnel from entry to completion</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md ${
              showMarketingData ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
            }`}
            onClick={() => setShowMarketingData(!showMarketingData)}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Marketing Attribution</span>
          </button>
        </div>
      </div>
      
      {showMarketingData && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
          <h4 className="text-xs font-medium text-blue-700 mb-1">Marketing Attribution</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Campaign:</span>{" "}
              <span className="font-medium">{mockMarketingData.campaignName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Source/Medium:</span>{" "}
              <span className="font-medium">{mockMarketingData.source} / {mockMarketingData.medium}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ad Group:</span>{" "}
              <span className="font-medium">{mockMarketingData.adGroup}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Creative:</span>{" "}
              <span className="font-medium">{mockMarketingData.adCreative}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Landing Page:</span>{" "}
              <span className="font-medium">{mockMarketingData.landingPage}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 overflow-x-auto">
        <div className="flex min-w-max">
          {flow.steps.map((step, index) => {
            const isLastStep = index === flow.steps.length - 1;
            const previousUsers = index > 0 ? flow.steps[index - 1].users : step.users;
            const dropOffRate = step.dropOff ? Math.round((step.dropOff / previousUsers) * 100) : 0;
            const hasFriction = step.friction && step.friction.length > 0;
            const isExpanded = expandedStepIndex === index;
            const detailedStep = detailedJourney[index] || null;
            
            return (
              <React.Fragment key={`step-${index}`}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-64 p-4 border rounded-lg ${
                      hasFriction ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className="font-medium">{step.label}</div>
                      <div className="text-sm text-muted-foreground">Step {index + 1}</div>
                      {detailedStep && (
                        <div className="text-xs text-blue-600 mt-1">
                          {detailedStep.page} 
                          <span className="text-muted-foreground ml-1">({formatTime(detailedStep.timeSpent)})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/40 p-2 rounded text-center">
                        <div className="font-medium">{step.users.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Users</div>
                      </div>
                      
                      <div className={`p-2 rounded text-center ${
                        dropOffRate > 30 ? 'bg-red-100 text-red-700' :
                        dropOffRate > 15 ? 'bg-amber-100 text-amber-700' :
                        'bg-muted/40'
                      }`}>
                        <div className="font-medium">{dropOffRate}%</div>
                        <div className="text-xs text-muted-foreground">Drop-off</div>
                      </div>
                    </div>
                    
                    {hasFriction && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertCircle size={14} className="text-amber-500" />
                          <span className="text-xs font-medium">Friction Detected</span>
                        </div>
                        <div className="space-y-1">
                          {step.friction?.map((issue, i) => (
                            <div key={i} className="text-xs px-2 py-1 bg-amber-100 rounded-sm">
                              {formatFrictionType(issue)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {detailedStep && (
                      <div className="mt-3 pt-2 border-t">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs justify-center"
                          onClick={() => setExpandedStepIndex(isExpanded ? null : index)}
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>
                        
                        {isExpanded && (
                          <div className="mt-2 space-y-2 text-xs bg-slate-50 p-2 rounded-md">
                            <div className="font-medium text-blue-700 border-b pb-1 mb-1">
                              User Actions on {detailedStep.page}
                            </div>
                            
                            {detailedStep.actions.map((action, i) => (
                              <div key={i} className="flex items-start gap-2 pb-2 border-b last:border-0 last:pb-0">
                                <div className="mt-1">
                                  {renderActionIcon(action.type)}
                                </div>
                                <div className="w-full">
                                  <div className="font-medium">{action.description}</div>
                                  <div className="text-muted-foreground flex justify-between text-2xs">
                                    <span>{action.element}</span>
                                    <span>{action.timestamp}{action.duration ? ` (${action.duration}s)` : ''}</span>
                                  </div>
                                  {action.type === 'hover' && action.hoverData && (
                                    <div className="mt-1 bg-blue-50 border border-blue-100 rounded p-1 text-2xs">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-blue-700">Hover Analytics:</span>
                                        <span className="font-medium">{action.hoverData.dwellTime}s dwell time</span>
                                      </div>
                                      <div className="text-muted-foreground truncate">
                                        Element: {action.hoverData.coordinates}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            <div className="text-right text-2xs text-muted-foreground italic">
                              URL: {detailedStep.url}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {step.dropOff && (
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-red-500">-{step.dropOff.toLocaleString()} users</div>
                    </div>
                  )}
                </div>
                
                {!isLastStep && (
                  <div className="flex items-center mx-4">
                    <ArrowRight className="text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
