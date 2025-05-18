import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { ArrowRight, Tag, Filter } from 'lucide-react';
import { JourneyStep } from './journey/JourneyStep';
import { MarketingAttributionPanel } from './journey/MarketingAttributionPanel';
import { FrictionScopeFilter, ScopeFilter } from './journey/FrictionScopeFilter';

interface JourneyFrictionMapProps {
  flow: Flow | null;
  cohortId?: string | null;
}

export const JourneyFrictionMap: React.FC<JourneyFrictionMapProps> = ({ flow, cohortId }) => {
  const [showMarketingData, setShowMarketingData] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>({});
  const [showScopeFilter, setShowScopeFilter] = useState(false);
  
  // Mock detailed journey data - in a real app this would come from backend
  const mockDetailedJourney: Record<string, any[]> = {
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

  // Get detailed journey for current flow
  const detailedJourney = mockDetailedJourney[flow.id] || [];

  // Mock marketing data - in a real app this would come from the backend
  const mockMarketingData = {
    campaignName: "Summer Sale 2023",
    source: "Google Ads",
    medium: "CPC",
    adGroup: "Product X - High Intent",
    adCreative: "50% Off Limited Time",
    landingPage: "/summer-promo"
  };

  // Apply filters to journey steps
  const filteredSteps = flow.steps.filter(step => {
    // Mock implementation of filtering logic
    const matchesVertical = !scopeFilter.pageVertical?.length || 
      scopeFilter.pageVertical.some(v => step.label.toLowerCase().includes(v.toLowerCase()));
    
    const matchesSection = !scopeFilter.pageSection?.length || 
      scopeFilter.pageSection.some(s => {
        // This would use actual data in a real implementation
        if (s === 'Form' && step.label.includes('Form')) return true;
        if (s === 'Pricing Table' && step.label.includes('Detail')) return true;
        if (s === 'CTA' && step.label.includes('Booking')) return true;
        return false;
      });
    
    const matchesPurpose = !scopeFilter.pagePurpose?.length ||
      scopeFilter.pagePurpose.some(p => {
        if (p === 'Conversion' && step.label.includes('Booking')) return true;
        if (p === 'Lead Gen' && step.label.includes('Home')) return true;
        return false;
      });
    
    return matchesVertical && matchesSection && matchesPurpose;
  });
  
  const hasFiltersApplied = Object.values(scopeFilter).some(arr => arr && arr.length > 0);
  
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
              showScopeFilter ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
            }`}
            onClick={() => setShowScopeFilter(!showScopeFilter)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Scoping Filters</span>
          </button>
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
      
      {showMarketingData && <MarketingAttributionPanel marketingData={mockMarketingData} />}
      
      {showScopeFilter && (
        <div className="px-6 pt-4">
          <FrictionScopeFilter 
            filter={scopeFilter}
            onFilterChange={setScopeFilter}
            onReset={() => setScopeFilter({})}
          />
        </div>
      )}
      
      {hasFiltersApplied && filteredSteps.length === 0 && (
        <div className="p-6 text-center">
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4">
            <h4 className="font-medium">No Data Available</h4>
            <p className="text-sm mt-1">Your current filters don't match any steps in this journey. Try adjusting your filters.</p>
          </div>
        </div>
      )}
      
      <div className="p-6 overflow-x-auto">
        <div className="flex min-w-max">
          {(hasFiltersApplied ? filteredSteps : flow.steps).map((step, index) => {
            const isLastStep = index === (hasFiltersApplied ? filteredSteps.length - 1 : flow.steps.length - 1);
            const previousUsers = index > 0 
              ? (hasFiltersApplied ? filteredSteps[index - 1].users : flow.steps[index - 1].users) 
              : step.users;
            const detailedStep = detailedJourney[index] || null;
            const isExpanded = expandedStepIndex === index;
            
            return (
              <React.Fragment key={`step-${index}`}>
                <JourneyStep 
                  step={step}
                  index={index}
                  isLastStep={isLastStep}
                  previousUsers={previousUsers}
                  detailedStep={detailedStep}
                  isExpanded={isExpanded}
                  toggleExpanded={() => setExpandedStepIndex(isExpanded ? null : index)}
                />
                
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
