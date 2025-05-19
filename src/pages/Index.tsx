
import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { SmartActionNudges } from '../components/SmartActionNudges';
import { SmartTestPlanner } from '../components/testing/SmartTestPlanner';

const Index = () => {
  return (
    <>
      <FrictionDashboard />
      
      <div className="container pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <SmartActionNudges />
          <SmartTestPlanner />
        </div>
      </div>
    </>
  );
};

export default Index;
