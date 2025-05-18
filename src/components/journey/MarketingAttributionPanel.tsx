
import React from 'react';

interface MarketingAttributionPanelProps {
  marketingData: {
    campaignName: string;
    source: string;
    medium: string;
    adGroup: string;
    adCreative: string;
    landingPage: string;
  };
}

export const MarketingAttributionPanel: React.FC<MarketingAttributionPanelProps> = ({ marketingData }) => {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
      <h4 className="text-xs font-medium text-blue-700 mb-1">Marketing Attribution</h4>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Campaign:</span>{" "}
          <span className="font-medium">{marketingData.campaignName}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Source/Medium:</span>{" "}
          <span className="font-medium">{marketingData.source} / {marketingData.medium}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Ad Group:</span>{" "}
          <span className="font-medium">{marketingData.adGroup}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Creative:</span>{" "}
          <span className="font-medium">{marketingData.adCreative}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Landing Page:</span>{" "}
          <span className="font-medium">{marketingData.landingPage}</span>
        </div>
      </div>
    </div>
  );
};
