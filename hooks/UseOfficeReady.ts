import { useState, useEffect } from 'react';

declare const Office: any;

export const useOfficeReady = () => {
  const [isOfficeInitialized, setIsOfficeInitialized] = useState(false);

  useEffect(() => {
    if (typeof Office !== 'undefined') {
      Office.onReady(() => {
        setIsOfficeInitialized(true);
      });
    }
  }, []);

  return isOfficeInitialized;
};
