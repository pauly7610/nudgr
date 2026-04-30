import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAnalyticsProperties, type AnalyticsProperty } from '@/hooks/useAnalyticsProperties';

const SELECTED_PROPERTY_STORAGE_KEY = 'nudgr_selected_property_id';
export const ALL_PROPERTIES_ID = 'all';

export interface AnalyticsPropertyContextValue {
  properties: AnalyticsProperty[];
  selectedPropertyId: string;
  selectedProperty: AnalyticsProperty | null;
  isLoading: boolean;
  setSelectedPropertyId: (propertyId: string) => void;
}

export const AnalyticsPropertyContext = createContext<AnalyticsPropertyContextValue | null>(null);

const readStoredPropertyId = (): string => {
  if (typeof window === 'undefined') {
    return ALL_PROPERTIES_ID;
  }

  return localStorage.getItem(SELECTED_PROPERTY_STORAGE_KEY) || ALL_PROPERTIES_ID;
};

export const AnalyticsPropertyProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: properties = [], isLoading } = useAnalyticsProperties();
  const [selectedPropertyId, setSelectedPropertyIdState] = useState(readStoredPropertyId);

  useEffect(() => {
    if (isLoading || selectedPropertyId === ALL_PROPERTIES_ID) {
      return;
    }

    const selectedStillExists = properties.some((property) => property.id === selectedPropertyId);
    if (!selectedStillExists) {
      setSelectedPropertyIdState(ALL_PROPERTIES_ID);
      localStorage.removeItem(SELECTED_PROPERTY_STORAGE_KEY);
    }
  }, [isLoading, properties, selectedPropertyId]);

  const setSelectedPropertyId = (propertyId: string) => {
    setSelectedPropertyIdState(propertyId);

    if (propertyId === ALL_PROPERTIES_ID) {
      localStorage.removeItem(SELECTED_PROPERTY_STORAGE_KEY);
      return;
    }

    localStorage.setItem(SELECTED_PROPERTY_STORAGE_KEY, propertyId);
  };

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId]
  );

  const value = useMemo(
    () => ({
      properties,
      selectedPropertyId,
      selectedProperty,
      isLoading,
      setSelectedPropertyId,
    }),
    [properties, selectedPropertyId, selectedProperty, isLoading]
  );

  return (
    <AnalyticsPropertyContext.Provider value={value}>
      {children}
    </AnalyticsPropertyContext.Provider>
  );
};

export const useAnalyticsPropertyContext = () => {
  const context = useContext(AnalyticsPropertyContext);
  if (!context) {
    throw new Error('useAnalyticsPropertyContext must be used inside AnalyticsPropertyProvider');
  }

  return context;
};
