import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CanonicalURLProps {
  baseUrl?: string;
}

export function CanonicalURL({ baseUrl = 'https://arcanumscribe.com' }: CanonicalURLProps) {
  const location = useLocation();

  useEffect(() => {
    // Remove any existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${baseUrl}${location.pathname}`;
    document.head.appendChild(canonical);

    // Cleanup on unmount
    return () => {
      const currentCanonical = document.querySelector('link[rel="canonical"]');
      if (currentCanonical) {
        currentCanonical.remove();
      }
    };
  }, [location.pathname, baseUrl]);

  return null;
}

// Hook for getting current canonical URL
export function useCanonicalURL(baseUrl = 'https://arcanumscribe.com') {
  const location = useLocation();
  return `${baseUrl}${location.pathname}`;
}