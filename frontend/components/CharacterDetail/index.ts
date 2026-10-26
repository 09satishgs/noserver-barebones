import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { CharacterDetailWeb } from './Views/CharacterDetailWeb';
import { CharacterDetailMobile } from './Views/CharacterDetailMobile';

export const CharacterDetail: React.FC = () => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? CharacterDetailWeb : CharacterDetailMobile);
};

export default CharacterDetail;
