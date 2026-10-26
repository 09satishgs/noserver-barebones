import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'web';

export function useBreakpoint(breakpointWidth: number = 768): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'web';
    return window.innerWidth < breakpointWidth ? 'mobile' : 'web';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const next: Breakpoint = window.innerWidth < breakpointWidth ? 'mobile' : 'web';
      setBreakpoint((prev) => (prev !== next ? next : prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpointWidth]);

  return breakpoint;
}
