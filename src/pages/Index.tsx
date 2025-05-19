
import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { SmartActionNudges } from '../components/SmartActionNudges';
import { SmartTestPlanner } from '../components/testing/SmartTestPlanner';

const Index = () => {
  return (
    <>
      <FrictionDashboard />
      
      <div className="container pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <SmartActionNudges />
        </div>
        <SmartTestPlanner />
      </div>
    </>
  );
};

export default Index;
