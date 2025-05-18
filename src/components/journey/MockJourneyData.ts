
export const getMockDetailedJourney = (flowId: string): Record<string, any[]> => {
  // Mock detailed journey data - in a real app this would come from backend
  return {
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
};

export const getMockMarketingData = () => {
  return {
    campaignName: "Summer Sale 2023",
    source: "Google Ads",
    medium: "CPC",
    adGroup: "Product X - High Intent",
    adCreative: "50% Off Limited Time",
    landingPage: "/summer-promo"
  };
};
