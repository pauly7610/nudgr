
import React from 'react';

interface NoDataMessageProps {
  message?: string;
}

export const NoDataMessage: React.FC<NoDataMessageProps> = ({ 
  message = "Your current filters don't match any steps in this journey. Try adjusting your filters."
}) => {
  return (
    <div className="p-6 text-center">
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4">
        <h4 className="font-medium">No Data Available</h4>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};
