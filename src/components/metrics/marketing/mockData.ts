import { MarketingMetricItem } from './types';

// Daily marketing metrics data (for 'day' selection)
export const dailyMarketingData: MarketingMetricItem[] = [
  {
    date: 'May 20 (9AM)',
    impressions: 1200,
    clicks: 60,
    views: 180,
    conversions: 6,
    authenticated: {
      impressions: 480,
      clicks: 36,
      views: 108,
      conversions: 5
    },
    nonAuthenticated: {
      impressions: 720,
      clicks: 24,
      views: 72,
      conversions: 1
    }
  },
  {
    date: 'May 20 (12PM)',
    impressions: 1500,
    clicks: 75,
    views: 225,
    conversions: 8,
    authenticated: {
      impressions: 600,
      clicks: 45,
      views: 135,
      conversions: 6
    },
    nonAuthenticated: {
      impressions: 900,
      clicks: 30,
      views: 90,
      conversions: 2
    }
  },
  {
    date: 'May 20 (3PM)',
    impressions: 1400,
    clicks: 70,
    views: 210,
    conversions: 7,
    authenticated: {
      impressions: 560,
      clicks: 42,
      views: 126,
      conversions: 6
    },
    nonAuthenticated: {
      impressions: 840,
      clicks: 28,
      views: 84,
      conversions: 1
    }
  },
  {
    date: 'May 20 (6PM)',
    impressions: 1700,
    clicks: 85,
    views: 255,
    conversions: 9,
    authenticated: {
      impressions: 680,
      clicks: 51,
      views: 153,
      conversions: 7
    },
    nonAuthenticated: {
      impressions: 1020,
      clicks: 34,
      views: 102,
      conversions: 2
    }
  }
];

// Weekly marketing metrics data (for '7days' selection - already existing data)
export const weeklyMarketingData: MarketingMetricItem[] = [
  {
    date: 'May 12',
    impressions: 12000,
    clicks: 600,
    views: 1800,
    conversions: 63,
    authenticated: {
      impressions: 4800,
      clicks: 360,
      views: 1080,
      conversions: 50
    },
    nonAuthenticated: {
      impressions: 7200,
      clicks: 240,
      views: 720,
      conversions: 13
    }
  },
  {
    date: 'May 13',
    impressions: 13200,
    clicks: 660,
    views: 1980,
    conversions: 69,
    authenticated: {
      impressions: 5280,
      clicks: 396,
      views: 1188,
      conversions: 55
    },
    nonAuthenticated: {
      impressions: 7920,
      clicks: 264,
      views: 792,
      conversions: 14
    }
  },
  {
    date: 'May 14',
    impressions: 11300,
    clicks: 565,
    views: 1700,
    conversions: 59,
    authenticated: {
      impressions: 4520,
      clicks: 339,
      views: 1020,
      conversions: 47
    },
    nonAuthenticated: {
      impressions: 6780,
      clicks: 226,
      views: 680,
      conversions: 12
    }
  },
  {
    date: 'May 15',
    impressions: 14500,
    clicks: 725,
    views: 2200,
    conversions: 77,
    authenticated: {
      impressions: 5800,
      clicks: 435,
      views: 1320,
      conversions: 61
    },
    nonAuthenticated: {
      impressions: 8700,
      clicks: 290,
      views: 880,
      conversions: 16
    }
  },
  {
    date: 'May 16',
    impressions: 15600,
    clicks: 780,
    views: 2375,
    conversions: 83,
    authenticated: {
      impressions: 6240,
      clicks: 468,
      views: 1425,
      conversions: 65
    },
    nonAuthenticated: {
      impressions: 9360,
      clicks: 312,
      views: 950,
      conversions: 18
    }
  },
  {
    date: 'May 17',
    impressions: 13900,
    clicks: 695,
    views: 2250,
    conversions: 79,
    authenticated: {
      impressions: 5560,
      clicks: 417,
      views: 1350,
      conversions: 62
    },
    nonAuthenticated: {
      impressions: 8340,
      clicks: 278,
      views: 900,
      conversions: 17
    }
  },
  {
    date: 'May 18',
    impressions: 12700,
    clicks: 635,
    views: 1975,
    conversions: 72,
    authenticated: {
      impressions: 5080,
      clicks: 381,
      views: 1185,
      conversions: 56
    },
    nonAuthenticated: {
      impressions: 7620,
      clicks: 254,
      views: 790,
      conversions: 16
    }
  }
];

// Monthly marketing metrics data (for '30days' selection)
export const monthlyMarketingData: MarketingMetricItem[] = [
  { 
    date: 'Apr 20', 
    impressions: 52000, 
    clicks: 2600, 
    views: 7800, 
    conversions: 273,
    authenticated: {
      impressions: 20800,
      clicks: 1560,
      views: 4680,
      conversions: 215
    },
    nonAuthenticated: {
      impressions: 31200,
      clicks: 1040,
      views: 3120,
      conversions: 58
    }
  },
  { 
    date: 'Apr 24', 
    impressions: 55000, 
    clicks: 2750, 
    views: 8250, 
    conversions: 289,
    authenticated: {
      impressions: 22000,
      clicks: 1650,
      views: 4950,
      conversions: 228
    },
    nonAuthenticated: {
      impressions: 33000,
      clicks: 1100,
      views: 3300,
      conversions: 61
    }
  },
  { 
    date: 'Apr 28', 
    impressions: 47500, 
    clicks: 2375, 
    views: 7125, 
    conversions: 249,
    authenticated: {
      impressions: 19000,
      clicks: 1425,
      views: 4275,
      conversions: 196
    },
    nonAuthenticated: {
      impressions: 28500,
      clicks: 950,
      views: 2850,
      conversions: 53
    }
  },
  { 
    date: 'May 2', 
    impressions: 59000, 
    clicks: 2950, 
    views: 8850, 
    conversions: 310,
    authenticated: {
      impressions: 23600,
      clicks: 1770,
      views: 5310,
      conversions: 244
    },
    nonAuthenticated: {
      impressions: 35400,
      clicks: 1180,
      views: 3540,
      conversions: 66
    }
  },
  { 
    date: 'May 6', 
    impressions: 62000, 
    clicks: 3100, 
    views: 9375, 
    conversions: 326,
    authenticated: {
      impressions: 24800,
      clicks: 1860,
      views: 5625,
      conversions: 257
    },
    nonAuthenticated: {
      impressions: 37200,
      clicks: 1240,
      views: 3750,
      conversions: 69
    }
  },
  { 
    date: 'May 10', 
    impressions: 56500, 
    clicks: 2825, 
    views: 8500, 
    conversions: 297,
    authenticated: {
      impressions: 22600,
      clicks: 1695,
      views: 5100,
      conversions: 234
    },
    nonAuthenticated: {
      impressions: 33900,
      clicks: 1130,
      views: 3400,
      conversions: 63
    }
  },
  { 
    date: 'May 14', 
    impressions: 53000, 
    clicks: 2650, 
    views: 8000, 
    conversions: 279,
    authenticated: {
      impressions: 21200,
      clicks: 1590,
      views: 4800,
      conversions: 220
    },
    nonAuthenticated: {
      impressions: 31800,
      clicks: 1060,
      views: 3200,
      conversions: 59
    }
  },
  { 
    date: 'May 18', 
    impressions: 51000, 
    clicks: 2550, 
    views: 7650, 
    conversions: 268,
    authenticated: {
      impressions: 20400,
      clicks: 1530,
      views: 4590,
      conversions: 211
    },
    nonAuthenticated: {
      impressions: 30600,
      clicks: 1020,
      views: 3060,
      conversions: 57
    }
  }
];

// Quarterly marketing metrics data (for '90days' selection)
export const quarterlyMarketingData: MarketingMetricItem[] = [
  { 
    date: 'Feb 20', 
    impressions: 185000, 
    clicks: 9250, 
    views: 27750, 
    conversions: 971,
    authenticated: {
      impressions: 74000,
      clicks: 5550,
      views: 16650,
      conversions: 765
    },
    nonAuthenticated: {
      impressions: 111000,
      clicks: 3700,
      views: 11100,
      conversions: 206
    }
  },
  { 
    date: 'Mar 5', 
    impressions: 196000, 
    clicks: 9800, 
    views: 29400, 
    conversions: 1029,
    authenticated: {
      impressions: 78400,
      clicks: 5880,
      views: 17640,
      conversions: 810
    },
    nonAuthenticated: {
      impressions: 117600,
      clicks: 3920,
      views: 11760,
      conversions: 219
    }
  },
  { 
    date: 'Mar 20', 
    impressions: 170000, 
    clicks: 8500, 
    views: 25500, 
    conversions: 893,
    authenticated: {
      impressions: 68000,
      clicks: 5100,
      views: 15300,
      conversions: 703
    },
    nonAuthenticated: {
      impressions: 102000,
      clicks: 3400,
      views: 10200,
      conversions: 190
    }
  },
  { 
    date: 'Apr 5', 
    impressions: 210000, 
    clicks: 10500, 
    views: 31500, 
    conversions: 1103,
    authenticated: {
      impressions: 84000,
      clicks: 6300,
      views: 18900,
      conversions: 869
    },
    nonAuthenticated: {
      impressions: 126000,
      clicks: 4200,
      views: 12600,
      conversions: 234
    }
  },
  { 
    date: 'Apr 20', 
    impressions: 220000, 
    clicks: 11000, 
    views: 33000, 
    conversions: 1155,
    authenticated: {
      impressions: 88000,
      clicks: 6600,
      views: 19800,
      conversions: 909
    },
    nonAuthenticated: {
      impressions: 132000,
      clicks: 4400,
      views: 13200,
      conversions: 246
    }
  },
  { 
    date: 'May 5', 
    impressions: 245000, 
    clicks: 12250, 
    views: 36750, 
    conversions: 1286,
    authenticated: {
      impressions: 98000,
      clicks: 7350,
      views: 22050,
      conversions: 1012
    },
    nonAuthenticated: {
      impressions: 147000,
      clicks: 4900,
      views: 14700,
      conversions: 274
    }
  },
  { 
    date: 'May 20', 
    impressions: 270000, 
    clicks: 13500, 
    views: 40500, 
    conversions: 1418,
    authenticated: {
      impressions: 108000,
      clicks: 8100,
      views: 24300,
      conversions: 1117
    },
    nonAuthenticated: {
      impressions: 162000,
      clicks: 5400,
      views: 16200,
      conversions: 301
    }
  }
];

// Export marketingData as the default data (for backward compatibility)
export const marketingData = weeklyMarketingData;
