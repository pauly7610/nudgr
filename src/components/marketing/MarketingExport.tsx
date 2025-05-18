
import React from 'react';

export const MarketingExport: React.FC = () => {
  return (
    <div className="mt-12 bg-blue-50 rounded-lg border border-blue-100 p-6">
      <h2 className="text-lg font-semibold mb-3 text-blue-800">Marketing Audience Export</h2>
      <p className="text-sm text-blue-700 mb-4">
        Export cohorts to your marketing platforms for targeted campaigns and personalized experiences.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
          <h3 className="font-medium">Email Marketing</h3>
          <p className="text-xs text-muted-foreground mt-1">Export to your email platform for targeted campaigns</p>
        </div>
        <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
          <h3 className="font-medium">Ad Platforms</h3>
          <p className="text-xs text-muted-foreground mt-1">Create custom audiences for retargeting campaigns</p>
        </div>
        <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
          <h3 className="font-medium">CRM Systems</h3>
          <p className="text-xs text-muted-foreground mt-1">Sync cohort data with your customer database</p>
        </div>
      </div>
    </div>
  );
};
