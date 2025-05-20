
import { MarketingMetricItem } from './types';

// Daily marketing metrics data (for 'day' selection)
export const dailyMarketingData: MarketingMetricItem[] = [
  {
    date: 'May 20 (9AM)',
    impressions: 3200,
    clicks: 160,
    views: 480,
    conversions: 16,
    authenticated: {
      impressions: 1280,
      clicks: 96,
      views: 288,
      conversions: 13
    },
    nonAuthenticated: {
      impressions: 1920,
      clicks: 64,
      views: 192,
      conversions: 3
    }
  },
  {
    date: 'May 20 (12PM)',
    impressions: 4100,
    clicks: 205,
    views: 615,
    conversions: 21,
    authenticated: {
      impressions: 1640,
      clicks: 123,
      views: 369,
      conversions: 17
    },
    nonAuthenticated: {
      impressions: 2460,
      clicks: 82,
      views: 246,
      conversions: 4
    }
  },
  {
    date: 'May 20 (3PM)',
    impressions: 3900,
    clicks: 195,
    views: 585,
    conversions: 20,
    authenticated: {
      impressions: 1560,
      clicks: 117,
      views: 351,
      conversions: 16
    },
    nonAuthenticated: {
      impressions: 2340,
      clicks: 78,
      views: 234,
      conversions: 4
    }
  },
  {
    date: 'May 20 (6PM)',
    impressions: 4500,
    clicks: 225,
    views: 675,
    conversions: 23,
    authenticated: {
      impressions: 1800,
      clicks: 135,
      views: 405,
      conversions: 18
    },
    nonAuthenticated: {
      impressions: 2700,
      clicks: 90,
      views: 270,
      conversions: 5
    }
  }
];

// Weekly marketing metrics data (for '7days' selection - already existing data)
export const weeklyMarketingData: MarketingMetricItem[] = [
  {
    date: 'May 12',
    impressions: 24500,
    clicks: 1225,
    views: 3750,
    conversions: 125,
    authenticated: {
      impressions: 9800,
      clicks: 735,
      views: 2250,
      conversions: 98
    },
    nonAuthenticated: {
      impressions: 14700,
      clicks: 490,
      views: 1500,
      conversions: 27
    }
  },
  {
    date: 'May 13',
    impressions: 26800,
    clicks: 1340,
    views: 4100,
    conversions: 142,
    authenticated: {
      impressions: 10720,
      clicks: 804,
      views: 2460,
      conversions: 112
    },
    nonAuthenticated: {
      impressions: 16080,
      clicks: 536,
      views: 1640,
      conversions: 30
    }
  },
  {
    date: 'May 14',
    impressions: 22300,
    clicks: 1115,
    views: 3400,
    conversions: 118,
    authenticated: {
      impressions: 8920,
      clicks: 669,
      views: 2040,
      conversions: 93
    },
    nonAuthenticated: {
      impressions: 13380,
      clicks: 446,
      views: 1360,
      conversions: 25
    }
  },
  {
    date: 'May 15',
    impressions: 28900,
    clicks: 1445,
    views: 4400,
    conversions: 154,
    authenticated: {
      impressions: 11560,
      clicks: 867,
      views: 2640,
      conversions: 121
    },
    nonAuthenticated: {
      impressions: 17340,
      clicks: 578,
      views: 1760,
      conversions: 33
    }
  },
  {
    date: 'May 16',
    impressions: 31200,
    clicks: 1560,
    views: 4750,
    conversions: 165,
    authenticated: {
      impressions: 12480,
      clicks: 936,
      views: 2850,
      conversions: 130
    },
    nonAuthenticated: {
      impressions: 18720,
      clicks: 624,
      views: 1900,
      conversions: 35
    }
  },
  {
    date: 'May 17',
    impressions: 29600,
    clicks: 1480,
    views: 4500,
    conversions: 158,
    authenticated: {
      impressions: 11840,
      clicks: 888,
      views: 2700,
      conversions: 124
    },
    nonAuthenticated: {
      impressions: 17760,
      clicks: 592,
      views: 1800,
      conversions: 34
    }
  },
  {
    date: 'May 18',
    impressions: 27200,
    clicks: 1360,
    views: 4150,
    conversions: 145,
    authenticated: {
      impressions: 10880,
      clicks: 816,
      views: 2490,
      conversions: 114
    },
    nonAuthenticated: {
      impressions: 16320,
      clicks: 544,
      views: 1660,
      conversions: 31
    }
  }
];

// Monthly marketing metrics data (for '30days' selection)
export const monthlyMarketingData: MarketingMetricItem[] = [
  { 
    date: 'Apr 20', 
    impressions: 18500, 
    clicks: 925, 
    views: 2700, 
    conversions: 94,
    authenticated: {
      impressions: 7400,
      clicks: 555,
      views: 1620,
      conversions: 74
    },
    nonAuthenticated: {
      impressions: 11100,
      clicks: 370,
      views: 1080,
      conversions: 20
    }
  },
  { 
    date: 'Apr 24', 
    impressions: 19800, 
    clicks: 990, 
    views: 3000, 
    conversions: 105,
    authenticated: {
      impressions: 7920,
      clicks: 594,
      views: 1800,
      conversions: 82
    },
    nonAuthenticated: {
      impressions: 11880,
      clicks: 396,
      views: 1200,
      conversions: 23
    }
  },
  { 
    date: 'Apr 28', 
    impressions: 21500, 
    clicks: 1075, 
    views: 3250, 
    conversions: 113,
    authenticated: {
      impressions: 8600,
      clicks: 645,
      views: 1950,
      conversions: 89
    },
    nonAuthenticated: {
      impressions: 12900,
      clicks: 430,
      views: 1300,
      conversions: 24
    }
  },
  { 
    date: 'May 2', 
    impressions: 23200, 
    clicks: 1160, 
    views: 3500, 
    conversions: 122,
    authenticated: {
      impressions: 9280,
      clicks: 696,
      views: 2100,
      conversions: 96
    },
    nonAuthenticated: {
      impressions: 13920,
      clicks: 464,
      views: 1400,
      conversions: 26
    }
  },
  { 
    date: 'May 6', 
    impressions: 24800, 
    clicks: 1240, 
    views: 3750, 
    conversions: 131,
    authenticated: {
      impressions: 9920,
      clicks: 744,
      views: 2250,
      conversions: 103
    },
    nonAuthenticated: {
      impressions: 14880,
      clicks: 496,
      views: 1500,
      conversions: 28
    }
  },
  { 
    date: 'May 10', 
    impressions: 26500, 
    clicks: 1325, 
    views: 4000, 
    conversions: 140,
    authenticated: {
      impressions: 10600,
      clicks: 795,
      views: 2400,
      conversions: 110
    },
    nonAuthenticated: {
      impressions: 15900,
      clicks: 530,
      views: 1600,
      conversions: 30
    }
  },
  { 
    date: 'May 14', 
    impressions: 28200, 
    clicks: 1410, 
    views: 4250, 
    conversions: 148,
    authenticated: {
      impressions: 11280,
      clicks: 846,
      views: 2550,
      conversions: 116
    },
    nonAuthenticated: {
      impressions: 16920,
      clicks: 564,
      views: 1700,
      conversions: 32
    }
  },
  { 
    date: 'May 18', 
    impressions: 29900, 
    clicks: 1495, 
    views: 4500, 
    conversions: 157,
    authenticated: {
      impressions: 11960,
      clicks: 897,
      views: 2700,
      conversions: 124
    },
    nonAuthenticated: {
      impressions: 17940,
      clicks: 598,
      views: 1800,
      conversions: 33
    }
  }
];

// Quarterly marketing metrics data (for '90days' selection)
export const quarterlyMarketingData: MarketingMetricItem[] = [
  { 
    date: 'Feb 20', 
    impressions: 12000, 
    clicks: 600, 
    views: 1800, 
    conversions: 63,
    authenticated: {
      impressions: 4800,
      clicks: 360,
      views: 1080,
      conversions: 49
    },
    nonAuthenticated: {
      impressions: 7200,
      clicks: 240,
      views: 720,
      conversions: 14
    }
  },
  { 
    date: 'Mar 5', 
    impressions: 14500, 
    clicks: 725, 
    views: 2175, 
    conversions: 76,
    authenticated: {
      impressions: 5800,
      clicks: 435,
      views: 1305,
      conversions: 60
    },
    nonAuthenticated: {
      impressions: 8700,
      clicks: 290,
      views: 870,
      conversions: 16
    }
  },
  { 
    date: 'Mar 20', 
    impressions: 17000, 
    clicks: 850, 
    views: 2550, 
    conversions: 89,
    authenticated: {
      impressions: 6800,
      clicks: 510,
      views: 1530,
      conversions: 70
    },
    nonAuthenticated: {
      impressions: 10200,
      clicks: 340,
      views: 1020,
      conversions: 19
    }
  },
  { 
    date: 'Apr 5', 
    impressions: 19500, 
    clicks: 975, 
    views: 2925, 
    conversions: 102,
    authenticated: {
      impressions: 7800,
      clicks: 585,
      views: 1755,
      conversions: 80
    },
    nonAuthenticated: {
      impressions: 11700,
      clicks: 390,
      views: 1170,
      conversions: 22
    }
  },
  { 
    date: 'Apr 20', 
    impressions: 22000, 
    clicks: 1100, 
    views: 3300, 
    conversions: 115,
    authenticated: {
      impressions: 8800,
      clicks: 660,
      views: 1980,
      conversions: 91
    },
    nonAuthenticated: {
      impressions: 13200,
      clicks: 440,
      views: 1320,
      conversions: 24
    }
  },
  { 
    date: 'May 5', 
    impressions: 24500, 
    clicks: 1225, 
    views: 3675, 
    conversions: 128,
    authenticated: {
      impressions: 9800,
      clicks: 735,
      views: 2205,
      conversions: 101
    },
    nonAuthenticated: {
      impressions: 14700,
      clicks: 490,
      views: 1470,
      conversions: 27
    }
  },
  { 
    date: 'May 20', 
    impressions: 27000, 
    clicks: 1350, 
    views: 4050, 
    conversions: 141,
    authenticated: {
      impressions: 10800,
      clicks: 810,
      views: 2430,
      conversions: 111
    },
    nonAuthenticated: {
      impressions: 16200,
      clicks: 540,
      views: 1620,
      conversions: 30
    }
  }
];

// Export marketingData as the default data (for backward compatibility)
export const marketingData = weeklyMarketingData;
