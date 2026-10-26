import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { HeaderWeb } from './Views/HeaderWeb';
import { HeaderMobile } from './Views/HeaderMobile';

export const Header: React.FC = () => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? HeaderWeb : HeaderMobile);
};

export default Header;
